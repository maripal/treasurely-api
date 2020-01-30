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
  // Have to add more vlaidation here for required fields to update
  
  Item.findById(req.params.id)
  .then(item => {
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