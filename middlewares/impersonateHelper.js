const User = require('../models/User');
const validateObjectId = require('../utils/validateObjectId');

const impersonateHelper = async (req, res, next) => {
  if (req.query.uid && validateObjectId(req.query.uid)) {
    try {
      const impersonatedUser = await User.findById(req.query.uid);
      if (impersonatedUser) {
        res.locals.impersonatingUser = impersonatedUser;
      }
    } catch (error) {
      console.error('Failed to fetch impersonated user data:', error);
    }
  }
  next();
};

module.exports = { impersonateHelper };
