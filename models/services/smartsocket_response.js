const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const smartsocketResponseSchema = new Schema({
  name: {
    type: String
  },
  smartprofile_id: {
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

module.exports = smartsocket_response = mongoose.model('smartsocket_response', smartsocketResponseSchema);