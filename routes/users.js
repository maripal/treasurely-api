const express = require('express');
const router = express.Router();
let User = require('../models/users');

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json({ message: "hello users route"}))
    .catch(err => res.status(400).json(`Error: ${err}`));
});

router.route('/add').post((req, res) => {
  let { username, password, firstName } = req.body;

  const newUser = new User({ username, password, firstName });
  console.log(newUser);

  newUser.save()
    .then(user => {
      res.status(201).json(user);
    })
    .catch(err => res.status(400).json(`Error ${err}`));
});

module.exports = router;