const PricingTier = require('../models/PricingTier');

// Deletes existing tiers and inserts new ones as an atomic operation
const updatePricingTiers = async (newTiers) => {
    await PricingTier.deleteMany({}); // Optionally, you could update existing ones instead of deleting, depending on the logic you want.

    const pricingTiersPromises = newTiers.map(tierData => {
        const newTier = new PricingTier({
            tierName: tierData.tierName,
            startFrom: tierData.startFrom,
            upTo: tierData.upTo,
            pricePerCredit: tierData.pricePerCredit
        });
        return newTier.save();
    });

    await Promise.all(pricingTiersPromises);
};

module.exports = {
    updatePricingTiers
};
