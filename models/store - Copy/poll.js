const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PollSchema = new Schema({
  name:{
      type: String
  },
  formName:{
      type: String
  },
  city: {
      type: String
  },
  phone: {
      type: String
  },
  polls: [{
    number:{
        type:Number
    },
    question: {
        type: String
    },
    answers: [{
        number:{
            type:Number
        },
        text:{
            type:String
        },
        selected:{
            type: Boolean,
            default: false
        }
    }],
    selectedQuestion:{
        type:Boolean,
        default: false
    }
  }],
  suggestions:{
      type: String
  },
  counter: { 
    type:Number
  }
});

module.exports = Poll = mongoose.model('poll', PollSchema);