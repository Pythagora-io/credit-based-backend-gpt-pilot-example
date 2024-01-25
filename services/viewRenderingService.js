const User = require('../models/User');
const { getInvoicesForUser } = require('./invoiceService');
const { getCreditUtilization } = require('./userService');

const renderUserDashboard = async (res, userId, currentPage = 'dashboard') => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).send('User not found');
      return;
    }
    const creditUtilization = await getCreditUtilization(userId);
    res.render('dashboard', { user, creditUtilization, currentPage });
    console.log('----')
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const renderUserBilling = async (res, userId, currentPage = 'billing') => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).send('User not found');
      return;
    }
    const invoices = await getInvoicesForUser(userId); // Fetch invoices for the user
    res.render('billing', { user, invoices, currentPage }); // Pass the invoices to the view
    console.log('----')
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const renderUserContact = async (res, userId, currentPage = 'contact') => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).send('User not found');
      return;
    }
    res.render('contact', { user, currentPage });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const renderUserApiInfo = async (res, userId, currentPage = 'api-info') => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).send('User not found');
      return;
    }
    res.render('api-info', { user, currentPage });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const renderUserBuyCredits = async (res, userId, currentPage = 'buy-credits') => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).send('User not found');
      return;
    }
    res.render('buy-credits', { user, currentPage });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  renderUserDashboard,
  renderUserBilling,
  renderUserContact,
  renderUserApiInfo,
  renderUserBuyCredits,
};
