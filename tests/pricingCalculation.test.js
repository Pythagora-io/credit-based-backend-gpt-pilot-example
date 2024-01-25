const { setupTestEnvironment, teardownTestEnvironment } = require('./setupEnv');
const User = require('../models/User');
const { calculateBillingAmount } = require('../services/billingCalculationService');
const PricingTier = require('../models/PricingTier');

beforeAll(async () => {
  await setupTestEnvironment();
});

afterAll(async () => {
  await teardownTestEnvironment();
});

describe('Custom and Default Pricing Logic', () => {
  let user;
  
  beforeEach(async () => {
    await User.deleteMany({});
    await PricingTier.deleteMany({});

    user = new User({
      username: 'testuser',
      email: 'test@example.com',
      credits: 0,
      customPricingTiers: [],
    });
    await user.save();

    const defaultPricingTiers = [
      { tierName: 'Free', startFrom: 0, upTo: 5000, pricePerCredit: 0 },
      { tierName: 'Small Business', startFrom: 5001, upTo: 505000, pricePerCredit: 0.0018 },
      { tierName: 'Enterprise', startFrom: 505001, upTo: Number.MAX_SAFE_INTEGER, pricePerCredit: 0.0009 },
    ];
    await PricingTier.insertMany(defaultPricingTiers);
  });

  it('should calculate the cost correctly using the default pricing tiers', async () => {
    const creditAmount = 10000;
    const cost = await calculateBillingAmount(user._id, creditAmount);

    const expectedCostCents = 5000 * 0.0018 * 100;
    expect(cost).toBe(expectedCostCents);
  });

  it('should calculate the cost correctly using custom pricing tiers', async () => {
    const customPricingTiers = [
      { tierName: 'Custom', startFrom: 0, upTo: Number.MAX_SAFE_INTEGER, pricePerCredit: 0.0015 }
    ];
    user.customPricingTiers = customPricingTiers;
    await user.save();

    const creditAmount = 10000;
    const cost = await calculateBillingAmount(user._id, creditAmount);

    const expectedCostCents = creditAmount * 0.0015 * 100;
    expect(cost).toBe(expectedCostCents);
  });

  // Add more tests to cover different cases like negative credit amounts, tier overlapping scenarios, etc.

});
