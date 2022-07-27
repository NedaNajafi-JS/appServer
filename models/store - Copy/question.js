const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  chargerId: {
    type: String
  },
  question: {
    type: String
  },
  response: [{
    responder: {
        type: Schema.Types.ObjectId,
        ref: 'profile'
    },
    text: {
        type: String,
    }
  }],
  date: {
    type: Date,
    default: Date.now
  },
  questioner: {
    type: Schema.Types.ObjectId,
    ref: 'profile'
  }
});

module.exports = Question = mongoose.model('question', QuestionSchema);