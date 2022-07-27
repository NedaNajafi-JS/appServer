const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const Profile = mongoose.model('profile');
const userAdmin = require('../models/userAdmin');
const keys = require('../config/keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromExtractors([ExtractJwt.fromBodyField('Authorization'), ExtractJwt.fromUrlQueryParameter('Authorization')]);
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      if(jwt_payload.phone!=undefined) {
        Profile.findById(jwt_payload.id)
          .then(user => {
            if (user) {
              return done(null, user);
            }
            return done(null, false);
          })
          .catch(err => console.log(err));
      }
      else if(jwt_payload.email!=undefined || jwt_payload.username!=undefined) {
        userAdmin.findById(jwt_payload.id)
          .then(user => {
            if (user) {
              return done(null, user);
            }
            return done(null, false);
          })
          .catch(err => console.log(err));
      }
    })
  );
};