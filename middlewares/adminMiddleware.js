const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.jwtToken;
    if (!token) {
      return res.status(401).render('message', 
        { messageTitle: 'Unauthorized', messageBody: 'No token provided. You need to log in.'});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      return res.status(404).render('message', 
        { messageTitle: 'Not Found', messageBody: 'User not found.' });
    }
    if (!user.isAdmin) {
      return res.status(403).render('message', 
        { messageTitle: 'Forbidden', messageBody: 'User is not authorized to access this resource.' });
    }
    req.user = user; // Save user object to request for later use.
    next();
  } catch (error) {
    console.error('isAdmin Middleware Error:', error);
    res.status(401).render('message', 
      { messageTitle: 'Unauthorized', messageBody: 'Unauthorized access. Please log in as an admin.' });
  }
};
