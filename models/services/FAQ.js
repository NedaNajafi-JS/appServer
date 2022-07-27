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

module.exports = new mongoose.model('services_FAQ', FAQSchema);