const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FAQSchema = new Schema({
  question: {
    type: String
  },
  answer: {
    type: String
  }
});

module.exports = FAQ = mongoose.model('FAQ', FAQSchema);