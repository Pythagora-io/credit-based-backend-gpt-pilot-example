require('dotenv').config();
const mongoose = require('mongoose');
const PricingTier = require('../models/PricingTier');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('MongoDB connected');

  // await mongoose.connection.db.admin().command({ setParameter: 1, failIndexKeyTooLong: false });
  await PricingTier.init(); // Ensure indexes are built

  const existingTiersCount = await PricingTier.countDocuments({});
  if (existingTiersCount === 0) {
    const tiers = [
      { tierName: 'Free', startFrom: 0, upTo: 5000, pricePerCredit: 0 },
      { tierName: 'Small Business', startFrom: 5001, upTo: 505000, pricePerCredit: 0.0018 },
      { tierName: 'Enterprise', startFrom: 505001, upTo: Number.MAX_SAFE_INTEGER, pricePerCredit: 0.0009 }
    ];

    await PricingTier.insertMany(tiers);
    console.log('Default pricing tiers have been set up.');
  } else {
    console.log('Default pricing tiers already exist.');
  }

  mongoose.disconnect();
})();
