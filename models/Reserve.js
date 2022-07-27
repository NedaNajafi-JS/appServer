const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReserveSchema = new Schema({
  stationId: {
    type: String,
    required: true
  },
  stationName:{
    type: String
  },
  stationNameEN:{
    type: String
  },
  user: {
    type: Schema.Types.ObjectId,
    // ref: 'users'
    ref: 'profile'
  },
  // carORmotor: {
  //   type: String,
  //   required: true
  // },
  vehicleType: {
    type: String,
    required: true
  },
  connector: {

    type: String,
    required: true
  },
  // connectorType: {
  //   type: String
  // },
  year: {
    type: String, //Number
    required: true
  },
  month: {
    type: String,
    required: true
  },
  day: {
    type: String,
    required: true
  },
  timeSection: {
    type: String,
    required: true
  },
  doReserveDate: {
    type: Date,
    default: Date.now
  },  
  cpID: {
    type: String
  }
});

module.exports = Reserve = mongoose.model('reserve', ReserveSchema);