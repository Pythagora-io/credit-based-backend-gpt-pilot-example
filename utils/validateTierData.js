const validatePricingTiers = (tiers) => {
  if (!Array.isArray(tiers)) {
    return { valid: false, message: "Pricing tiers data should be an array." };
  }

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];

    if (typeof tier.tierName !== 'string' || tier.tierName.trim() === '') {
      return { valid: false, message: `The 'tierName' of tier ${i + 1} is required and should be a string.` };
    }
    if (typeof tier.startFrom !== 'number' || tier.startFrom < 0) {
      return { valid: false, message: `The 'startFrom' of tier ${i + 1} is required and should be a non-negative number.` };
    }
    if (typeof tier.upTo !== 'number' || tier.upTo <= tier.startFrom) {
      return { valid: false, message: `The 'upTo' of tier ${i + 1} is required and cannot be less than or equal to 'startFrom'.` };
    }
    if (typeof tier.pricePerCredit !== 'number' || tier.pricePerCredit < 0) {
      return { valid: false, message: `The 'pricePerCredit' of tier ${i + 1} is required and should be a non-negative number.` };
    }
  }

  return { valid: true, message: "All pricing tiers are valid." };
};

module.exports = { validatePricingTiers };