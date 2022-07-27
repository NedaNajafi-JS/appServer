const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ComplaintResponseSchema = new Schema({
  name: {
    type: String
  },
  complaint_id: {
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

module.exports = ComplaintResponse = mongoose.model('complaintresponse', ComplaintResponseSchema);