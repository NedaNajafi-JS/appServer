const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RefTokPollSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  refreshToken: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  }
});

module.exports = RefTokPoll = mongoose.model('reftokpoll', RefTokPollSchema);