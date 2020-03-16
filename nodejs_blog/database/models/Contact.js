const mongoose = require('mongoose');

const ContactScheme = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

const Contact = mongoose.model('Contact', ContactScheme);
module.exports = Contact;
