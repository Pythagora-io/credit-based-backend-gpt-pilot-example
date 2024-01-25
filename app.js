const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('./config/passport');
require('./config/dotenv');
const cookieParser = require('cookie-parser');
const { impersonateHelper } = require('./middlewares/impersonateHelper');

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 }
}));

app.use(impersonateHelper);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (req.originalUrl === '/api/billing/stripe-webhook') {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

const database = require('./config/database');
database.connect(() => {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  if (process.env.NODE_ENV === 'test') {
    server.close(() => {
      console.log('Server closed for tests');
    });
  }
});

app.use(passport.initialize());
app.use(passport.session());

const { attachUserCredits } = require('./middlewares/userCreditsMiddleware');
app.use(attachUserCredits);

app.use(express.static('public'));

const viewRoutes = require('./routes/viewRoutes');
app.use('/', viewRoutes);

app.set('view engine', 'ejs');

app.get('/ping', (req, res) => {
  res.send('pong');
});

const authRoutes= require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const { router: billingRouter } = require('./routes/billingRoutes');
app.use('/api/billing', billingRouter);

const creditRoutes= require('./routes/creditRoutes');
app.use('/api/credits', creditRoutes);

const adminRoutes= require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const { setupScheduledTasks } = require('./services/scheduledTasks');
setupScheduledTasks();

app.post('/api/billing/stripe-webhook', express.raw({type: 'application/json'}), (req, res, next) => {
  const billingRoutes = require('./routes/billingRoutes');
  billingRoutes.stripeWebhook(req, res, next);
});

const adminPricingRoutes = require('./routes/adminPricingRoutes');
app.use('/api/admin', adminPricingRoutes);

const adminImpersonationRoutes = require('./routes/adminImpersonationRoutes');
app.use('/api/admin', adminImpersonationRoutes);

module.exports = app;
