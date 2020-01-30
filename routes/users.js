const express = require('express');
const router = express.Router();
const User = require('../models/users');

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(400).json(`Error: ${err}`));
});

router.route('/add').post((req, res) => {
  let { username, password, firstName } = req.body;

  //const newUser = new User({ username, password, firstName });
  //console.log(newUser);

  return User.find({username})
    .count()
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