const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.jwtToken;
    if (!token) {
      throw new Error();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    next();
  } catch (error) {
    res.clearCookie('jwtToken');
    res.status(401).redirect('/login');
  }
};
