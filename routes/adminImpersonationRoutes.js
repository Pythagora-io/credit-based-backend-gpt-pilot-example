const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middlewares/adminMiddleware');
const validateObjectId = require('../utils/validateObjectId');

router.get('/impersonate/:userId', isAdmin, async (req, res) => {
  const { userId } = req.params;
  
  if (!validateObjectId(userId)) {
    return res.status(400).render('message', 
      { messageTitle: 'Error', messageBody: 'Invalid user ID provided.' });
  }
  res.redirect(`/dashboard?uid=${userId}`);
});

module.exports = router;