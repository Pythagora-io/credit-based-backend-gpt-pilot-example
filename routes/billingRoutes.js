const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const paypal = require('../config/paypal');
const User = require('../models/User');
const { isLoggedIn } = require('../middlewares/authMiddleware');
const Invoice = require('../models/Invoice');
const { generateReceipt } = require('../services/invoiceService');
const { calculateBillingAmount } = require('../services/billingCalculationService');
const CONSTANTS = require('../config/constants');
const { sendPaymentConfirmationEmail } = require('../services/paymentNotificationService');

router.post('/create-checkout-session', isLoggedIn, async (req, res) => {
  const { credits: creditAmount } = req.body;
  const user = req.user;
  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email
    });

    stripeCustomerId = customer.id;
    user.stripeCustomerId = stripeCustomerId;
    await user.save();
  }

  const price = await calculateBillingAmount(user._id, creditAmount);

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${creditAmount} Credits for Credits Backend Example`,
        },
        unit_amount: price,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.LOCAL_URL}/billing/success`,
    cancel_url: `${process.env.LOCAL_URL}/billing/cancel`,
    metadata: {
      userId: user._id.toString(),
      creditsPurchased: creditAmount
    }
  });

  res.json({ url: checkoutSession.url });
});

router.post('/update-auto-replenish', isLoggedIn, async (req, res) => {
  let { isEnabled, threshold, creditsToPurchase } = req.body;
  const isEnabledBool = isEnabled === 'on' || isEnabled === true;
  const thresholdNum = parseInt(threshold, 10);
  const creditsToPurchaseNum = parseInt(creditsToPurchase, 10);

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.autoReplenishEnabled = isEnabledBool;
    user.autoReplenishThreshold = thresholdNum;
    user.autoReplenishAmount = creditsToPurchaseNum;

    await user.save();
    res.status(200).json({ message: 'Auto-replenish settings updated.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating auto-replenish settings', error: error.message });
  }
});

router.get('/download-receipt/:invoiceId', async (req, res) => {
  const { invoiceId } = req.params;

  try {
    const receiptPath = await generateReceipt(invoiceId);
    res.download(receiptPath);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


router.post('/create-paypal-payment', isLoggedIn, async (req, res) => {
  const { creditsToPurchase } = req.body;
  const user = req.user;
  const priceInCents = await calculateBillingAmount(user._id, creditsToPurchase);

  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": `${process.env.LOCAL_URL}/api/billing/paypal-success`,
        "cancel_url": `${process.env.LOCAL_URL}/api/billing/paypal-cancel`
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": `${creditsToPurchase} credits for Credits Backend Example`,
                "sku": "credits",
                "price": (priceInCents / 100).toFixed(2),
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": (priceInCents / 100).toFixed(2)
        },
        "description": "Purchase of credits for Credits Backend Example",
        "custom": `${creditsToPurchase.toString()}`
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        console.error('Create Payment Error:', error);
        res.status(500).send('An error occurred while creating PayPal payment');
    } else {
        // Store the paymentId in the user's session for later use
        req.session.paymentId = payment.id;
        const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
        res.json({ url: approvalUrl });
    }
  });
});

router.get('/paypal-success', isLoggedIn, async (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId; // Retrieve paymentId from the query parameters

  paypal.payment.execute(paymentId, { payer_id: payerId }, async function (error, payment) {
    if (error) {
      console.error('PayPal payment execution error:', error);
      res.status(500).send('Error processing PayPal payment');
    } else {
      if (payment.state === 'approved') {
        const userId = req.user._id;
        const creditsPurchased = parseInt(payment.transactions[0].item_list.items[0].quantity, 10);

        const user = await User.findById(userId);
        if (user) {
          const creditsPurchased = parseInt(payment.transactions[0].custom, 10); // Correctly retrieve the number of credits purchased
          user.paypalCustomerId = payment.id; // Save the payer's PayPal ID
          user.credits += creditsPurchased; // Increment the user's credits according to the purchase
          await user.save();

          // If you have additional services or steps that need to be triggered after payment confirmation,
          // include them here, such as sending a confirmation email, updating accounting records, etc.

          res.redirect('/billing/success');
        } else {
          res.status(404).send('User not found');
        }
      } else {
        res.redirect('/billing/cancel');
      }
    }
  });
});

router.get('/paypal-cancel', isLoggedIn, (req, res) => {
  res.redirect('/billing/cancel');
});

router.post('/paypal-webhook', async (req, res) => {
  try {
    // Verify the PayPal webhook, the exact verification method will depend on PayPal's SDK or API documentation
    const isVerified = require('../utils/paypalWebhookVerification').verifyPaypalWebhook(req);
    if (!isVerified) {
      return res.status(401).send('Webhook not verified');
    }

    const event = req.body;
    if (event.event_type === 'BILLING.SUBSCRIPTION.CREATED' && event.resource && event.resource.status === 'ACTIVE') {
      const userId = event.resource.custom_id;
      const creditsPurchased = event.resource.credits_purchased; // replace with the actual key from PayPal payload
      const amountPaid = event.resource.amount_paid; // replace with the actual key from PayPal payload

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send('User not found.');
      }

      user.credits += creditsPurchased;
      await user.save();

      const invoice = new Invoice({
        userId: user._id,
        creditsPurchased: creditsPurchased,
        amountPaid: amountPaid,  // assuming the amount is in cents
        paypalSubscriptionId: event.resource.id
      });
      await invoice.save();

      return res.status(200).json({ message: 'Subscription processed and invoice created', invoice: invoice });
    } else {
      return res.status(400).send('Unhandled event type');
    }
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    return res.status(500).send('Internal Server Error');
  }
});

const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (!event || !event.type) {
    return res.status(400).send('Invalid webhook event.');
  }

  if (event.type === 'invoice.payment_succeeded' || event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerId = session.customer;
    let user = await User.find({ stripeCustomerId: customerId }).exec();
    user = user[0];
    if (!user) {
      return res.status(404).send('User not found.');
    }

    user.credits += parseInt(session.metadata.creditsPurchased);
    if (user.credits >= CONSTANTS.LOW_CREDIT_THRESHOLD) {
        user.lowCreditAlertSent = false;
    }
    await user.save();

    const invoice = await new Invoice({
      userId: user._id,
      creditsPurchased: parseInt(session.metadata.creditsPurchased),
      amountPaid: session.amount_total,
      stripePaymentIntentId: session.payment_intent
    }).save();

    await sendPaymentConfirmationEmail(user, parseInt(session.metadata.creditsPurchased), session.amount_total);

    res.status(200).json({ received: true });
  } else {
    res.status(400).send(`Unhandled event type: ${event.type}`);
  }
};

module.exports = {
  router,
  stripeWebhook
};
