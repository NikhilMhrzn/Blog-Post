const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const RegisterScheme = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your username']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please provide your password']
  }
});

const Register = mongoose.model('Register', RegisterScheme);
module.exports = Register;
