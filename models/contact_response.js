const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactResponseSchema = new Schema({
  name: {
    type: String
  },
  contact_id: {
    type: String
  },
  response: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = ContactResponse = mongoose.model('contactresponse', ContactResponseSchema);