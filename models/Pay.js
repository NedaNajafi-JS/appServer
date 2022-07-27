const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    // ref: 'users'
    ref: 'profile'
  },
  // handle: {
  //   type: String,   
  //   required: true
  // },
  Amount: {
    type: Number,
    required: true
  },
  Description: {
    type: String,
    required: true
  },
  RefID: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  //change
  type: {//0:Increase inventory, 1: store, 2: charge, 3: Increase inventory batterySwap,4:swap
    type: Number
  },
  InvoiceNumber: {
    type: Number,
    default: 0
  },
  currency: {
    type: Number
  },
  balance: {
    type: Number
  }
  //change
});

module.exports = Pay = mongoose.model('pay', PaySchema);