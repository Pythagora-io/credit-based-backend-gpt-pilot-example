const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      user.comparePassword(password, (err, isMatch) => {
        if (err) { return done(err); }
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    } catch (err) {
      return done(err);
    }
  }
));

const options = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('bearer'),
  secretOrKey: process.env.JWT_SECRET || 'some_secret'
};

passport.use(new JWTStrategy(options, (jwt_payload, done) => {
  User.findOne({id: jwt_payload.sub}, (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}));

module.exports = passport;
