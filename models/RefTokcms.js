const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RefTokcmsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  refreshToken: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

module.exports = RefTokcms = mongoose.model('reftokcms', RefTokcmsSchema);