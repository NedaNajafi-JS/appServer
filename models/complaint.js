const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ComplaintSchema = new Schema({
  name: {
    type: String
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  subject: {
    type: String
  },
  message: {
    type: String
  },
  responsed:{
    type:Boolean,
    default:false
  },
  date: {
    type: Date,
    default: Date.now
  },
  unread: {// 1: unread, 0: read
    type: Boolean
  }
});

module.exports = Complaint = mongoose.model('complaint', ComplaintSchema);