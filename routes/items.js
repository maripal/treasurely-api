const express = require('express');
const router = express.Router();
let Item = require('../models/items');

router.route('/').get((req, res) => {
  Item.find() 
  .then(items => res.status(200).json(items))
  .catch(err => res.status(400).json(`Error: ${err}`));
});

router.route('/add').post((req, res) => {
  const { name, price } = req.body;

  const newItem = new Item({
    name,
    price
  });

  newItem.save()
  .then(() => res.status(201).json(`Item added!`))
  .catch(err => res.status(400).json(`Error: ${err}`));
});

module.exports = router;