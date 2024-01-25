// This method sets up nock to intercept Stripe API calls
const setupStripeNock = (nock) => {
  nock('https://api.stripe.com')
    .persist()
    .post('/v1/customers')
    .reply(200, { id: 'cus_fakeStripeCustomerId' })
    // Add more mocked endpoints if necessary
};

// This function mocks a checkout.session.completed event
const mockStripeCheckoutSession = (userId, credits) => {
  return {
    id: 'cs_test_example',
    object: 'checkout.session',
    type: 'checkout.session.completed', // Added the 'type' property
    customer: 'cus_fakeStripeCustomerId',
    line_items: [
      // Line item details go here.
    ],
    metadata: {
      userId,
      creditsPurchased: credits,
    }
    // Other session properties as needed
  };
};

module.exports = {
  setupStripeNock,
  mockStripeCheckoutSession,
};
