const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middlewares/adminMiddleware');
const PricingTier = require('../models/PricingTier');

router.get('/pricing-tiers', isAdmin, async (req, res) => {
  try {
    const tiers = await PricingTier.find().lean();
    res.render('admin/pricing-tiers', { tiers });
  } catch (error) {
    console.error('Error retrieving pricing tiers:', error);
    res.status(500).render('admin/error', { message: 'Error retrieving pricing tiers.' });
  }
});

const { validatePricingTiers } = require('../utils/validateTierData');

router.post('/pricing-tiers', isAdmin, async (req, res) => {
  // Extract tier information from request body and format into tier objects
  const tiersData = Object.keys(req.body)
    .reduce((acc, key) => {
      const indexMatch = key.match(/(\d+)$/);
      if (!indexMatch) return acc; // Skip keys that don't end in a number
      const index = indexMatch[0];
      const propName = key.replace(indexMatch[0], '');

      if (!acc[index]) acc[index] = {};
      acc[index][propName] = req.body[key];
      return acc;
    }, []).map(tierData => ({
      tierName: tierData.tierName,
      startFrom: Number(tierData.startFrom),
      upTo: Number(tierData.upTo),
      pricePerCredit: Number(tierData.pricePerCredit)
    }));

  const { valid, message } = validatePricingTiers(tiersData);

  if (!valid) {
    return res.status(400).render('admin/error', { message });
  }

  try {
    await PricingTier.deleteMany({}); // Remove all existing PricingTier docs
    await PricingTier.insertMany(tiersData); // Insert the new pricing tiers
    res.redirect('/api/admin/pricing-tiers');
  } catch (error) {
    console.error('Error updating pricing tiers:', error);
    res.status(500).render('admin/error', { message: 'Error updating pricing tiers.' });
  }
});

module.exports = router;
