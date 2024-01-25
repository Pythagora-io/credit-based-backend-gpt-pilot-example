const User = require('../models/User');

exports.attachUserCredits = async (req, res, next) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        res.locals.userCredits = user.credits;
      }
    }
    next();
  } catch (error) {
    console.error('Error attaching user credits to locals:', error);
    next();
  }
};
