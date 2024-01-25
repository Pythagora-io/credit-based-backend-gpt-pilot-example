const mongoose = require('mongoose');

const PricingTierSchema = new mongoose.Schema({
  tierName: { type: String, required: true, unique: true },
  startFrom: { type: Number, required: true },
  upTo: { type: Number, required: true },
  pricePerCredit: { type: Number, required: true }
});

const PricingTier = mongoose.model('PricingTier', PricingTierSchema);

module.exports = PricingTier;
