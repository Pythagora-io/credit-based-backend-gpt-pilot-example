const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middlewares/adminMiddleware');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { getCreditUtilization } = require('../services/userService');
const { getInvoicesForUser } = require('../services/invoiceService');
const stripe = require('../config/stripe');
const Invoice = require('../models/Invoice');
const { createCustomInvoice } = require('../services/customInvoiceService');
const { updateCustomPricingTiers } = require('../services/customPricingService');
const CONSTANTS = require('../config/constants');
const validateObjectId = require('../utils/validateObjectId');

router.get('/admin-dashboard', isAdmin, (req, res) => {
  res.render('admin/admin-dashboard');
});

router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.render('admin/users', { users });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users.', error: error.message });
  }
});

router.get('/edit-user/:userId', isAdmin, async (req, res) => {
  const { userId } = req.params;
  if (!validateObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user id provided." });
  }
  try {
    const user = await User.findById(req.params.userId);
    const creditUtilization = await getCreditUtilization(req.params.userId);
    const invoices = await getInvoicesForUser(req.params.userId);
    if (!user) {
      return res.status(404).render('admin/error', { message: 'User not found' });
    }
    res.render('admin/edit-user', { 
      user, 
      creditUtilization, 
      invoices, 
      currentPage: 'edit-user'
    });
  } catch (error) {
    res.status(500).render('admin/error', { message: 'Error retrieving user data ' + error.message, error: error.message });
  }
});

router.post('/update-user/:userId', isAdmin, async (req, res) => {
  const { userId } = req.params;
  if (!validateObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user id provided." });
  }
  const { email, username, street, city, zipcode, country } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.email = email;
    user.username = username;
    user.street = street;
    user.city = city;
    user.zipcode = zipcode;
    user.country = country;
    await user.save();
    res.status(200).json({ message: 'User details updated successfully.' });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Failed to update user details.', error: error.message });
  }
});

router.post('/adjust-credits/:userId', isAdmin, async (req, res) => {
  const { userId } = req.params;
  if (!validateObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user id provided." });
  }
  const { creditAmount } = req.body;
  const amount = parseInt(creditAmount, 10);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.credits += amount;
    if (user.credits >= CONSTANTS.LOW_CREDIT_THRESHOLD) {
        user.lowCreditAlertSent = false;
    }
    await user.save();
    res.status(200).json({ message: 'User credits adjusted successfully.', credits: user.credits });
  } catch (error) {
    console.error('Error adjusting user credits:', error);
    res.status(500).json({ message: 'Failed to adjust user credits.', error: error.message });
  }
});

router.post('/create-invoice/:userId', isAdmin, async (req, res) => {
  const { userId } = req.params;
  if (!validateObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user id provided." });
  }
  try {
    const { amount, credits } = req.body;
    const amountInCents = parseInt(parseFloat(amount) * 100);

    const invoiceData = await createCustomInvoice(userId, amountInCents, credits);
    
    res.json({ message: 'Invoice created successfully', invoice: invoiceData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify-email/:userId', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!validateObjectId(userId)) {
      return res.status(400).send("Invalid user id provided.");
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found.');
    }
    user.emailVerified = true;
    await user.save();

    return res.status(200).send('User email successfully verified.');
  } catch (error) {
    console.error('Error verifying user email:', error);
    return res.status(500).send('Internal server error.');
  }
});

router.post('/refund-invoice/:invoiceId', isAdmin, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    if (!invoiceId || !validateObjectId(invoiceId)) {
      return res.status(400).json({ message: "Invalid invoice id provided." });
    }
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }
    if (!invoice.stripePaymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID not found for this invoice.' });
    }
    const refund = await stripe.refunds.create({
      payment_intent: invoice.stripePaymentIntentId
    });
    if (refund.status === 'succeeded') {
      const user = await User.findById(invoice.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      user.credits -= invoice.creditsPurchased;
      if (user.credits < 0) {
        user.credits = 0;
      }
      await user.save();
      invoice.refunded = true;
      await invoice.save();
      return res.json({ message: 'Refund processed successfully.', refund });
    } else {
      throw new Error('Refund failed to process on Stripe');
    }
  } catch (error) {
    console.error('Refund Error:', error);
    res.status(500).json({ message: 'Error processing the refund.', error: error.message });
  }
});

router.post('/users/:userId/pricing-tiers', isAdmin, async (req, res) => {
  const { userId } = req.params;
  if (!validateObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user id provided." });
  }
  try {
    const pricingTiers = req.body; // Assuming pricingTiers is an object with structure { tierName, startFrom, upTo, pricePerCredit }

    const updatedPricingTiers = await updateCustomPricingTiers(userId, pricingTiers);
    res.status(200).json({ message: 'Custom pricing tier updated successfully', pricingTiers: updatedPricingTiers });
  } catch (error) {
    console.error('Error updating custom pricing tier:', error);
    res.status(500).json({ message: 'Failed to update custom pricing tier.', error: error.message });
  }
});

module.exports = router;
