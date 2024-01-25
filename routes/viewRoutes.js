const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/authMiddleware');
const viewRenderingService = require('../services/viewRenderingService');
const validateObjectId = require('../utils/validateObjectId');

router.get('/', (req, res) => {
    res.redirect('/dashboard');
});

const renderPagesAsUser = async (req, res, page, currentPage) => {
  const impersonatedUserId = req.query.uid;
  if (impersonatedUserId) {
    const isAdminUser = req.user && req.user.isAdmin;
    if (isAdminUser && validateObjectId(impersonatedUserId)) {
      const serviceMethodName = `renderUser${page.charAt(0).toUpperCase() + page.slice(1)}`;
      if (viewRenderingService[serviceMethodName]) {
        await viewRenderingService[serviceMethodName](res, impersonatedUserId, currentPage);
      } else {
        res.status(404).send(`${serviceMethodName} is not a valid view rendering service method.`);
      }
    } else {
      res.status(403).render('error', { message: 'Unauthorized impersonation attempt detected.' });
    }
  } else {
    await viewRenderingService[`renderUser${page.charAt(0).toUpperCase() + page.slice(1)}`](res, req.user._id, currentPage);
  }
};

router.get('/register', (req, res) => {
  res.render('register', { user: req.user });
});

router.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

router.get('/dashboard', isLoggedIn, async (req, res) => {
  await renderPagesAsUser(req, res, 'Dashboard', 'dashboard');
});

router.get('/billing', isLoggedIn, async (req, res) => {
  await renderPagesAsUser(req, res, 'Billing', 'billing');
});

router.get('/contact', isLoggedIn, async (req, res) => {
    await renderPagesAsUser(req, res, 'Contact', 'contact');
});

router.get('/api-info', isLoggedIn, async (req, res) => {
    await renderPagesAsUser(req, res, 'ApiInfo', 'api-info');
});

router.get('/buy-credits', isLoggedIn, async (req, res) => {
    await renderPagesAsUser(req, res, 'BuyCredits', 'buy-credits');
});

router.get('/reset-password/:token', (req, res) => {
  const token = req.params.token;
  res.render('reset-password', { token: token });
});

router.get('/billing/success', isLoggedIn, async (req, res) => {
  res.render('billing-success', { user: req.user });
});

router.get('/billing/cancel', isLoggedIn, (req, res) => {
  res.render('billing-cancel', { user: req.user });
});

router.get('/forgot-password', (req, res) => {
  res.render('forgot-password');
});

module.exports = router;
