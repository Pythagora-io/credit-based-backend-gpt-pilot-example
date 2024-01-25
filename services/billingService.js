const stripe = require('../config/stripe');
const paypal = require('../config/paypal');

const chargeStripeUser = async (user, price) => {
  // Implement logic to charge user through Stripe
  // [Logic omitted for brevity]
};

const chargePaypalUser = async (user, price) => {
  // Implement logic to charge user through PayPal
  // [Logic omitted for brevity]
};

module.exports = { chargeStripeUser, chargePaypalUser };
