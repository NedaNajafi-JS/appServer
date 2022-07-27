const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CountOfReservedChargersSchema = new Schema({
  stationId: {
    type: String,
    required: true
  },
  /*numberOfCarChargers: {
    type: Number
  },
  numberOfMotorChargers: {
    type: Number
  }, */
  year: {
    type: String
  },
  month: {
    type: String
  },
  day: {
    type: String
  },
  timeSection: {
    type: String
  },
  cpID: {
    type: String
  },
  connector: {
    type: String
  },
  // connectorType: {
  //   type: String
  // },
  // carORmotor: {
  //   type: String
  // },
  vehicleType: {
    type: String,
  },
  counter: {
    type: Number
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'profile'
  },
  /*nCHAdeMO: {
    type: Number
  },
  nCCS1: {
    type: Number
  },
  nDC_CCS2: {
    type: Number
  },
  
  nType1: {
    type: Number
  },
  nAC_Type2: {
    type: Number
  },
  nGBT: {
    type: Number
  },
  /*nOPPcharge: {
    type: Number
  },*/
 /* nChaoji: {
    type: Number
  },
  //---------------------motor----------------
  nAC_Motorcycle: {
    type: Number
  },
  nAC_Type1_Motorcycle: {
    type: Number
  },
  nAC_Type2_Motorcycle: {
    type: Number
  },
  //-----------------end motor---------------

  //-------------------bus-----------------
  nType2_GB: {
    type: Number
  },
  nBUS_CCS2: {
    type: Number
  },
  nBUS_Type2: {
    type: Number
  },*/
  numberOfChargers:{
    'Car-DC-CHAdeMO': Number,
    'Car-DC-CCS1': Number,
    'Car-DC-CCS2': Number,
    "Car-DC-GB/T": Number,
    "Car-AC-Type1": Number,
    "Car-AC-Type2": Number,
    "Car-AC-GB/T": Number,
    'Car-DC-Chaoji': Number,
    "Bus-AC-GB/Ttype2": Number,
    "Bus-AC-Type2": Number,
    "Bus-DC-CCS2": Number,
    'Motorcycle-AC-Default': Number,
    'Motorcycle-AC-Type1': Number,
    'Motorcycle-AC-Type2': Number
  }
});

module.exports = CountOfReservedChargers = mongoose.model("countofreservedchargers", CountOfReservedChargersSchema);
CountOfReservedChargers.createCollection();