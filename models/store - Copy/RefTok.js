const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RefTokstoreSchema = new Schema({
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

module.exports = RefTokstore = mongoose.model('reftokstore', RefTokstoreSchema);