const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const operationDetailSchema = new Schema({
  operationID: {
    type: Schema.Types.ObjectId,
    ref: 'operation'
  },
  productID:  {
    type: Schema.Types.ObjectId,
    ref: 'storechargers'
  },
  options: [{
    attrID: String,
    valueID: String,
    attrTitle: String,
    valueTitle: String,
    valueName: String,
    price: String
  }],
  quantity: Number,
  price: Number,//without discount for one product
  priceTotal: Number,//with discount, tax, deliveryPrice, quantity*price, InstallationPrice
  afterdiscount: Number,
  deliveryPrice: Number,
  InstallationPrice: Number,
  discount: String,
  tax: Number,
  
  returnedInfo:{
    isReturned: Boolean,
    numReturned: Number,
    dateReturned: Date,
    reason: String,
    description: String,
    confirmed: Number, //1: basic information, 2: additional information, 3: confirmed by operator
    confirmedDate: Date,
    image: String
  }
  
});

module.exports = operationDetail = mongoose.model('operationDetail', operationDetailSchema);