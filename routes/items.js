const express = require('express');
const router = express.Router();
let Item = require('../models/items');

router.route('/').get((req, res) => {
  Item.find
  .then(items => res.status(200).json(items))
  .catch(err => res.status(400).json(`Error: ${err}`));
});



module.exports = router;