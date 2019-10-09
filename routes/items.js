const express = require('express');
const router = express.Router();
let Item = require('../models/items');

router.route('/').get((req, res) => {
  Item.find() 
  //.populate({'path': 'user'})
  .then(items => res.send(items.map(item => item.serialize())))
  .catch(err => res.status(400).json(`Error: ${err}`));
});

router.route('/:id').get((req, res) => {
  Item.findById(req.params.id)
  .then(item => res.json(item.serialize()))
  .catch(err => res.status(400).json(`Error: ${err}`));
});

router.route('/add').post((req, res) => {
  const name = req.body.name;
  const price = Number(req.body.price);

  const newItem = new Item({
    name,
    price
  });

  console.log(newItem)

  newItem.save()
  .then(item => res.status(201).json(item.serialize()))
  .catch(err => res.status(400).json(`Error: ${err}`));
});

module.exports = router;