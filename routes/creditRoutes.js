const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isLoggedIn } = require('../middlewares/authMiddleware');
const calculateTierPrice = require('../utils/calculateTierPrice');
const validateObjectId = require('../utils/validateObjectId');

router.post('/updateCredits', isLoggedIn, async (req, res) => {
  const { userId, creditsUsed } = req.body;
  if (!validateObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user id provided." });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const startOfCurrentMonth = new Date();
    startOfCurrentMonth.setDate(1);
    startOfCurrentMonth.setHours(0, 0, 0, 0);
    if (user.lastFreeCreditsReset < startOfCurrentMonth) {
      user.freeCreditsUsed = 0;
      user.lastFreeCreditsReset = new Date();
    }
    
    if (user.freeCreditsUsed < 5000) {
      let freeCreditsRemaining = 5000 - user.freeCreditsUsed;
      let freeCreditsToUse = Math.min(creditsUsed, freeCreditsRemaining);
      user.freeCreditsUsed += freeCreditsToUse;
      creditsUsed -= freeCreditsToUse;
    }

    user.credits -= creditsUsed;
    const updatedUser = await user.save();

    res.json({
      success: true,
      credits: updatedUser.credits,
      freeCreditsUsed: updatedUser.freeCreditsUsed
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating credits', error: error });
  }
});

router.get('/credit-price/:creditAmount', isLoggedIn, async (req, res) => {
  const { creditAmount } = req.params;
  if (!creditAmount) {
    return res.status(400).json({ error: 'Credit amount parameter is required' });
  }

  try {
    const user = req.user;
    const price = await calculateTierPrice(user._id, parseInt(creditAmount, 10));
    return res.json({ price });
  } catch (error) {
    console.error('Error calculating credit price:', error);
    return res.status(500).json({ error: 'Error calculating credit price' });
  }
});

module.exports = router;
