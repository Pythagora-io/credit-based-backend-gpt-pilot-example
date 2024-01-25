const PricingTier = require('../models/PricingTier');
const User = require('../models/User');
const { toObjectId } = require('../utils/objectIdHelpers');

const calculateCostWithTiers = (creditAmount, creditBalance, pricingTiers) => {
  let cost = 0;
  let remainingCredits = creditAmount;

  for (const tier of pricingTiers) {
    if (remainingCredits > 0 && creditBalance >= tier.startFrom - 1 && creditBalance < tier.upTo) {
      const applicableCredits = Math.min(remainingCredits, tier.upTo - creditBalance);
      cost += applicableCredits * tier.pricePerCredit;
      remainingCredits -= applicableCredits;
      creditBalance += applicableCredits;
    }
  }

  return Math.round(cost * 100); // Return cost in cents
};

const calculateBillingAmount = async (userId, creditAmount) => {
    const validUserId = toObjectId(userId);
    if (!validUserId) {
        throw new Error('Invalid user ID.');
    }
    
    const user = await User.findById(validUserId);
    if (!user) {
        throw new Error('User not found.');
    }
    const pricingTiers = user.customPricingTiers.length > 0 ? user.customPricingTiers : await PricingTier.find({});

    const price = await calculateCostWithTiers(creditAmount, user.credits, pricingTiers);
    return price;
};

module.exports = {
    calculateBillingAmount,
};
