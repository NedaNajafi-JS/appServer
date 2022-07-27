const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  name: {
    type: String
  },
  title: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  comment: {
    type: String
  },
  email: {
    type: String
  },
  chargerId: {
    type: String
  }
});

module.exports = Comment = mongoose.model('comment', CommentSchema);