const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
});

userSchema.methods.serialize = function() {
  return {
    id: this._id,
    username: this.username,
    firstName: this.firstName
  };
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
}

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
}

const User = mongoose.model('User', userSchema);

module.exports = User;