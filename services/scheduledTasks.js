const cron = require('node-cron');
const User = require('../models/User');
const stripe = require('../config/stripe');
const calculateTierPrice = require('../utils/calculateTierPrice');
const { notifyLowCredit } = require('./lowCreditNotificationService');
const { sendAutoReplenishEmail } = require('./autoReplenishNotificationService');

const CONSTANTS = require('../config/constants');

const chargeUser = async (user, amount) => {
  const { stripeCustomerId } = user;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: stripeCustomerId,
    });
    return paymentIntent;
  } catch (error) {
    console.error(`Failed to charge user ${user.email}:`, error);
    return null;
  }
};

const processAutoReplenish = async () => {
  try {
    const users = await User.find({ autoReplenishEnabled: true }).exec();
    users.forEach(async userDoc => {
      const user = userDoc.toObject();
      if (user.stripeCustomerId && user.credits < user.autoReplenishThreshold) {
        const price = await calculateTierPrice(user._id, user.autoReplenishAmount);

        let paymentIntent = await chargeUser(user, price);
        if (paymentIntent) {
          userDoc.credits += user.autoReplenishAmount;
          await userDoc.save();

          await sendAutoReplenishEmail(userDoc, user.autoReplenishAmount, price);
        }
      }
    });
  } catch (error) {
    console.error('Failed to process auto-replenish:', error);
  }
};

const resetMonthlyFreeCredits = async () => {
  const startOfCurrentMonth = new Date();
  startOfCurrentMonth.setDate(1);
  startOfCurrentMonth.setHours(0, 0, 0, 0);

  await User.updateMany(
    {
      lastFreeCreditsReset: { $lt: startOfCurrentMonth }
    },
    {
      $set: { freeCreditsUsed: 0, lastFreeCreditsReset: new Date() }
    }
  );
};

const checkUsersForLowCredits = async () => {
  const users = await User.find({});
  for (let user of users) {
    await notifyLowCredit(user._id);
  }
};

const checkAndResetLowCreditAlert = async () => {
  const users = await User.find({ lowCreditAlertSent: true });
  users.forEach(async user => {
    if (user.credits >= CONSTANTS.LOW_CREDIT_THRESHOLD) {
      user.lowCreditAlertSent = false;
      await user.save();
    }
  });
};

const setupScheduledTasks = () => {
  cron.schedule('* * * * *', () => {
    processAutoReplenish();
  });

  cron.schedule('0 0 1 * *', resetMonthlyFreeCredits);
  cron.schedule('* * * * *', checkUsersForLowCredits);
  cron.schedule('* * * * *', checkAndResetLowCreditAlert);
};

module.exports = {
  setupScheduledTasks
};
