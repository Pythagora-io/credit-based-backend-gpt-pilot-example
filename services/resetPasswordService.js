const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.resetPasswordService = {
  resetPassword: async (token, password) => {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Password reset token is invalid or has expired.');
    }
    
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
  }
};
