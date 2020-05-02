const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

const itemSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  purchased: { type: Boolean, default: false }
});

itemSchema.methods.serialize = function() {
  return {
    id: this._id,
    user: this.user,
    name: this.name,
    price: this.price,
    purchased: this.purchased
  };
};

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;