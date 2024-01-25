const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const crypto = require('crypto');
const { transporter } = require('../config/mailer');
const { generatePasswordResetToken, sendPasswordResetEmail } = require('../services/passwordResetService');
const validateObjectId = require('../utils/validateObjectId');

router.post('/register', async (req, res) => {
  const { username, email, password, isAdmin } = req.body;
  if (!username || !email || !password) {
    return res.status(400).send('Missing required fields');
  }
  try {
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).send('Email already registered');
    }

    user = await User.findOne({ username: username });
    if (user) {
      return res.status(400).send('Username already exists');
    }

    user = new User({
      username,
      email,
      password,
      isAdmin: isAdmin === 'true'
    });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.log(error);
    res.status(400).send('Registration failed');
  }
});

router.post('/login', passport.authenticate('local', { session: false }), (req, res, next) => {
  const token = jwt.sign({ _id: req.user._id, apiKey: req.user.apiKey }, process.env.JWT_SECRET, { expiresIn: '1y' });
  res.cookie('jwtToken', token, {
    httpOnly: true,
    maxAge: 365 * 24 * 60 * 60 * 1000
  });
  res.redirect('/dashboard');
});

const EXPRESS_SUCCESS_STATUS_CODE = 200;

router.post('/requestPasswordReset', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).render('message', {
      messageTitle: 'Error',
      messageBody: 'User with that email does not exist.',
    });

    const token = generatePasswordResetToken();
    sendPasswordResetEmail(user.email, token);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 600000; // 10 minutes from now
    await user.save();

    res.status(EXPRESS_SUCCESS_STATUS_CODE).render('message', {
      messageTitle: 'Success',
      messageBody: 'Password reset token has been sent to your email.',
    });
  } catch (error) {
    res.status(500).render('message', {
      messageTitle: 'Error',
      messageBody: error.message,
    });
  }
});

const { resetPasswordService } = require('../services/resetPasswordService');

router.post('/resetPassword/:token', async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  if (!validateObjectId(token)) {
    return res.status(400).json({ message: "Invalid user id provided." });
  }
  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match.');
  }

  try {
    await resetPasswordService.resetPassword(token, password);
    res.redirect('/login?message=Password reset successfully. Please login with your new password.');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('jwtToken');
  res.redirect('/');
});

module.exports = router;
