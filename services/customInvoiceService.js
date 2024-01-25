const User = require('../models/User');
const Invoice = require('../models/Invoice');
const stripe = require('../config/stripe');
const { chargeUser } = require("./stripeService");

const createCustomInvoice = async (userId, amountInCents, credits) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  if (!user.stripeCustomerId) {
    throw new Error('Stripe customer ID not found for user.');
  }

  // Charge the user using Stripe
  let paymentIntent = await chargeUser(user, amountInCents);

  // Proceed only if payment intent is successful
  if (paymentIntent && paymentIntent.status === 'succeeded') {
    // Increment the user's credits by the purchased amount
    user.credits += parseInt(credits, 10);
    await user.save();

    // Create and save the invoice
    let newInvoice = new Invoice({
      userId: user._id,
      creditsPurchased: credits,
      amountPaid: amountInCents,
      stripePaymentIntentId: paymentIntent.id,
    });
    await newInvoice.save();

    return newInvoice;
  } else {
    throw new Error('Unable to process payment and create invoice.');
  }
};

module.exports = { createCustomInvoice };
