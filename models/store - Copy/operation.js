const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const operationSchema = new Schema({
  status:  Number,
  paid: {
    type: Boolean,
    default: false
  },
  profileID: {
    type: Schema.Types.ObjectId,
    ref: 'profile'
  },
  createDate1: {
    type: Date
  },
  confirmDate3: {
    type: Date
  },
  preparingDate4: {
    type: Date
  },
  expectedDeliveryDays:{
    type: Number
  },
  expectedDeliveryDate:{
    type: Date
  },
  sendingDate5: {
    type: Date
  },
  deliveryDate6: {
    type: Date
  },
  deliveredDate7: {
    type: Date
  },
  netCost: Number,
  docs:{
      parkingPic:{
        path: String,
        status: Number
      },
      powerMeterPic:{
        path: String,
        status: Number
      }
  },
  trackingCode: String,
  address: String,
  addressStatus: {
    type:Number,
    default: 0
  },
  rejectDescription: String,
  postalCode: String,
  hasReturned: Boolean,
  dateReturned: Date
});

module.exports = operation = mongoose.model('operation', operationSchema);