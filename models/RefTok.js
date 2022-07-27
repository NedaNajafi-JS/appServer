const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RefTokSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      },
  refreshToken: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  }
});

module.exports = RefTok = mongoose.model('reftok', RefTokSchema);