const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const itemSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  purchased: Boolean
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;