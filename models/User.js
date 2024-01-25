const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pricingTierSchema = new mongoose.Schema({
  tierName: { type: String, required: true },
  startFrom: { type: Number, required: true },
  upTo: { type: Number, required: true },
  pricePerCredit: { type: Number, required: true },
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    unique: true
  },
  credits: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  stripeCustomerId: { type: String, default: null },
  freeCreditsUsed: {
    type: Number,
    default: 0
  },
  lastFreeCreditsReset: {
    type: Date, 
    default: Date.now
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  autoReplenishEnabled: {
    type: Boolean,
    default: false
  },
  autoReplenishThreshold: {
    type: Number,
    default: 0
  },
  autoReplenishAmount: {
    type: Number,
    default: 0
  },
  street: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  zipcode: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  // Add a new field 'paypalCustomerId' with type String and default value 'null' to the User model schema.
  paypalCustomerId: {
    type: String,
    default: null,
  },
  customPricingTiers: [pricingTierSchema],
  lowCreditAlertSent: {
    type: Boolean,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    default: false
  }
});

UserSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
  }
  if (this.isNew || !this.apiKey) {
    this.apiKey = uuidv4();
  }
  next();
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);
