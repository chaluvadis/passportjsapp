var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var config = require('../models/auth')

//user registration route
router.get('/register', function (req, res) {
  res.render('register');
});

//Login route
router.get('/login', function (req, res) {
  res.render('login');
});

//user registration route
router.post('/register', function (req, res) {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var confirmpassword = req.body.confirmpassword;

  //validation
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('confirmpassword', 'Confirm Password is required').notEmpty();
  req.checkBody('confirmpassword', 'Confirm Password is not matched').equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    console.log(errors);
    res.render('register', {
      errors: errors
    })
  } else {
    var newUser = new User({
      'username': username,
      'email': email,
      'password': password
    });
    User.createUser(newUser, function (err, user) {
      if (err) return err;
      console.log(user);
    });
    req.flash('success_msg', 'You are registerd, you can login now');
    res.redirect('/users/login');
  }
});

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  console.log('in deserialize user');
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function (username, password, done) {
    User.getUserByUsername(username, function (err, user) {
      if (err) return err;
      if (!user) {
        return done(null, false, {
          message: 'Unknown User'
        });
      }
      User.comparePasswords(password, user.password, function (err, isMatch) {
        if (err) return err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {
            message: 'Invalid Password'
          });
        }
      })
    })
  }
));


router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  }),
  function (req, res) {
    res.redirect('/');
  }
);

//facebook staratagy
var fbCallback = (accessToken, refreshToken, profile, done) => {
  console.log('in call back stratagy');
  console.log(accessToken, refreshToken, profile);
  if(profile){
      User.createUser();
      return done(null, profile);
  } 
  return done(null, false);
}

//facebook strategy
passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
    profileFields: ['id', 'email', 'first_name', 'last_name']
  },
  fbCallback
));


//facebook strategy
router.get('/auth/facebook', passport.authenticate('facebook', {
  scope: 'public_profile'
}));


router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
      successRedirect: '/',
      failureRedirect: '/users/login',
      failureFlash: true
    }),
  function (req, res) {
    res.redirect('/');
  }
);

router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
