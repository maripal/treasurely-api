const express = require('express');
const router = express.Router();
const User = require('../models/users');
const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', { session: false });

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(400).json(`Error: ${err}`));
});

router.route('/total').put(jwtAuth, (req, res) => {
  console.log(req.body)
  console.log(req.user.id)
  User.updateOne({_id: req.user.id}, { $set: { totalSavings: req.body.totalSavings } }, { new: true })
    // .then(amount => res.status(201).json(amount))
    .then(amount => res.status(201).json({totalSavings: req.body.totalSavings}))
    // .then(amount => console.log(amount.totalSavings))
    .catch(err => res.status(400).json(`Error: ${err}`))
})

router.route('/add').post((req, res) => {
  let { username, password, firstName } = req.body;

  // Check for required fields
  const requiredFields = ['username', 'password', 'firstName'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['username', 'password', 'firstName'];
  const nonStringField = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected a string',
      location: nonStringField
    });
  }

  // Give error if username or password has any whitespace. No trimming.
  const explicitlyTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.find(field => req.body[field].trim() !== req.body[field]);

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  // Check username & password length
  const acceptedSizedFields = {
    username: {
      min: 3
    },
    password: {
      min: 10,
      max: 72
    }
  };

  const tooSmallField = Object.keys(acceptedSizedFields).find(field => 
    'min' in acceptedSizedFields[field] && req.body[field].trim().length < acceptedSizedFields[field].min
    );

  const tooLargeField = Object.keys(acceptedSizedFields).find(field =>
    'max' in acceptedSizedFields[field] && req.body[field].trim().length > acceptedSizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField ? `Must be at least ${acceptedSizedFields[tooSmallField].min} characters long` :
      `Must be at most ${acceptedSizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  return User.find({username})
    // count() is deprecated
    .countDocuments()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already exists',
          location: username
        });
      }
      // if username doesn't exist, return hashed password
      return User.hashPassword(password);
    })
    .then(hash => {
      return new User({ username, password: hash, firstName }).save();
    })
    .then(user => {
      res.status(201).json(user.serialize());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal Server Error'})
    });
});

module.exports = router;