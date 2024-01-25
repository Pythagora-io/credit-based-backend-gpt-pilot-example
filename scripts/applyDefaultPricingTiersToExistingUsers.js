require('dotenv').config();
const mongoose = require('mongoose');
const connectionString = process.env.MONGODB_URI;
const User = require('../models/User');
const PricingTier = require('../models/PricingTier');

async function applyDefaultPricingTiers() {
  await mongoose.connect(connectionString);

  console.log('Connected to MongoDB');

  const defaultPricingTiers = await PricingTier.find({});

  if (!defaultPricingTiers.length) {
    console.log('No default pricing tiers found. Exiting...');
    await mongoose.disconnect();
    return;
  }

  const users = await User.find({}); // Fetch all users
  for (const user of users) {
    if (user.customPricingTiers.length === 0) {
      user.customPricingTiers = defaultPricingTiers;
      await user.save();
      console.log(`Updated user ${user.username} with default pricing tiers`);
    }
  }

  console.log('All users have been updated with default pricing tiers');
  await mongoose.disconnect();
}

applyDefaultPricingTiers().catch((error) => {
  console.error('Failed to apply default pricing tiers to existing users:', error);
  mongoose.disconnect();
});
