const express = require('express');
const router = express.Router();
const Item = require('../models/items');
const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', {session: false});

router.route('/').get(jwtAuth, (req, res) => {
  Item.find({user: req.user.id}) 
  .populate('user')
  .then(items => res.send(items.map(item => item.serialize())))
  .catch(err => res.status(400).json(`Error: ${err}`));
});

router.route('/:id').get(jwtAuth, (req, res) => {
  Item.findById(req.params.id)
  .then(item => res.json(item.serialize()))
  .catch(err => res.status(400).json(`Error: ${err}`));
});

router.route('/add').post(jwtAuth, (req, res) => {


  const user = req.user.id
  const name = req.body.name;
  const price = Number(req.body.price);
  const purchased = false;

  // Check for required fields
  const requiredFields = ['name', 'price'];

  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  const newItem = new Item({
    user,
    name,
    price,
    purchased
  });

  console.log(newItem)

  newItem.save()
  .then(item => res.status(201).json(item.serialize()))
  .catch(err => res.status(400).json(`Error: ${err}`));
});

router.route('/update/:id').put(jwtAuth, (req ,res) => {
  // Check for required fields
  const requiredFields = ['name', 'price'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  // Check if item path id matches req.body id
  if (req.params.id !== req.body.id) {
    const message = `Request path id ${req.params.id} and request body id ${req.body.id} must match`;
    console.error(message);
    return res.status(400).send(message);
  }
  
  Item.findById(req.params.id)
  .then(item => {
    item.id = req.params.id;
    item.name = req.body.name;
    item.price = req.body.price;
    item.purchased = req.body.purchased;

    item.save()
    .then(item => res.status(200).json(item.serialize()))
    .catch(err => res.status(500).json(`Error: ${err}`));
  });
});

router.route('/:id').delete(jwtAuth, (req, res) => {
  Item.findByIdAndDelete(req.params.id)
  .then(()=> res.sendStatus(204).end())
  .catch(err => res.status(500).json(`Error: ${err}`));
});

module.exports = router;