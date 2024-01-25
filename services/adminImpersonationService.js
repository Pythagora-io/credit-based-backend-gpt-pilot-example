const User = require('../models/User');
const { getCreditUtilization } = require('./userService');
const Invoice = require('../models/Invoice');

const getUserDashboardData = async (userId) => {
  const user = await User.findById(userId);  // Fetch the actual user data
  const creditUtilization = await getCreditUtilization(userId);
  const invoices = await Invoice.find({ userId: userId }).sort({ createdAt: -1 }).lean();
  const dashboardData = {
    user: user,  // Include the user data here
    creditUtilization,
    invoices,
  };
  return dashboardData;
};

module.exports = {
  getUserDashboardData,
};
