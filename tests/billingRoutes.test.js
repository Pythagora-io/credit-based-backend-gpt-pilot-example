const supertest = require('supertest');
const nock = require('nock');
const app = require('../app'); // After update
const User = require('../models/User');
const { setupStripeNock, mockStripeCheckoutSession } = require('./mocks/stripe');

const request = supertest(app);

beforeEach(() => {
  setupStripeNock(nock);
});

afterEach(() => {
  nock.cleanAll();
});

describe('Stripe webhook endpoint', () => {
  it('handles checkout.session.completed event and creates an invoice', async () => {
    const fakeUserId = '1234567890abcdef';
    const fakeUser = {
      _id: fakeUserId,
      email: 'test@example.com',
      credits: 10000,
      save: jest.fn().mockResolvedValue(true),
    };
    
    User.findOne.mockResolvedValue(fakeUser);
    
    const session = mockStripeCheckoutSession(fakeUserId, 5000);
    
    const response = await request.post('/api/billing/stripe-webhook')
      .set('Stripe-Signature', 't=123456,v1=fake_signature,v0=another_fake_signature')
      .send(session);
      
    expect(response.status).toBe(200);
    expect(User.findOne).toBeCalledWith({ stripeCustomerId: session.customer });
    expect(fakeUser.save).toBeCalled();
    expect(fakeUser.credits).toBe(session.metadata.creditsPurchased);
    
    // Add more assertions as needed
  });

  // Add more tests as necessary...
});
