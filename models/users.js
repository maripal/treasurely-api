const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { 
    type: String, 
    unique: true,
    trim: true,
    required: true,  
  },
  password: { type: String, required: true },
  firstName: { type: String },
  total: { type: Number }
});

const User = mongoose.model('User', userSchema);

module.exports = User;