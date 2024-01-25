const User = require('../models/User');
const CreditUsage = require('../models/CreditUsage');

const getCreditUtilization = async (userId) => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000));
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  const creditUtilization = {
    lastDay: await CreditUsage.aggregate([
      { $match: { userId, date: { $gte: oneDayAgo } } },
      { $group: { _id: null, total: { $sum: '$creditsUsed' } } }
    ]),
    last7Days: await CreditUsage.aggregate([
      { $match: { userId, date: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$creditsUsed' } } }
    ]),
    last30Days: await CreditUsage.aggregate([
      { $match: { userId, date: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$creditsUsed' } } }
    ])
  };

  return {
    lastDay: creditUtilization.lastDay[0] ? creditUtilization.lastDay[0].total : 0,
    last7Days: creditUtilization.last7Days[0] ? creditUtilization.last7Days[0].total : 0,
    last30Days: creditUtilization.last30Days[0] ? creditUtilization.last30Days[0].total : 0
  };
};

module.exports = {
  getCreditUtilization
};
