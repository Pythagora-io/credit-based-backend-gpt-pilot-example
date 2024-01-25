const User = require('../models/User');

const updateCustomPricingTiers = async (userId, pricingTiers) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  user.customPricingTiers = pricingTiers;
  await user.save();
  return user.customPricingTiers;
};

module.exports = { updateCustomPricingTiers };
