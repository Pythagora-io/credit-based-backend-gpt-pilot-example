const { calculateBillingAmount } = require('../services/billingCalculationService');

const calculateTierPrice = async (userId, creditsToPurchase) => {
  return await calculateBillingAmount(userId, creditsToPurchase);
};

module.exports = calculateTierPrice;
