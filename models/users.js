const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { 
    type: String, 
    unique: true,
    trim: true,
    required: true,
    minlength: 3
  },
  password: { type: String, required: true },
  firstName: { type: String, required: true, minlength: 3 },
  total: { type: Number }
});

const User = mongoose.model('User', userSchema);

module.exports = User;