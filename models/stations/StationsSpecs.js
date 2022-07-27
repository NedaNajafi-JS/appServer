const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StationsSpecsSchema = new Schema({
  stationId: {
    type: String,
    required: true
  },
  stationName: {
    type:String
  },
  stationNameEn: {//ENname
    type:String
  },
  provinceId: {
    type: String,
    required: true
  },
  isActive:{  
    type:Boolean
  },
  isFree:{  
    type:Boolean
  },
  isOCPP:{  
    type:Boolean
  },
  tariff: {
    type: Number
  },
  location: {
    type: {
      type: String, 
      enum: ['Point']
    },
    coordinates: { 
      type: [Number]  //ex: [35.1232445,51.2342423]
    }
  },
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
  },
  stationCPIDs:[{
    type:Array,
    CPID: {
        type: String
    },
    model:[{
        type: String
    }],
    keyConnector: []
}],
  specs:{ 
    description:{ //Ex: اولین ایستگاه شارژ خودروی برقی درایران واقع در محوطه برج میلاد و فلان و بیسار و بهمان
        type:String
    }, 
    descriptionEn:{ //Ex: اولین ایستگاه شارژ خودروی برقی درایران واقع در محوطه برج میلاد و فلان و بیسار و بهمان
      type:String
    }, 
    workDays:{  //ex: همه روزه
        type:String
    }, 
    workDaysEn:{  //ex: همه روزه
        type:String
    }, 
    workHours:{  //ex: از 8 صبح تا 12 شب
        type:String
    }, 
    workHoursEn:{  //ex: از 8 صبح تا 12 شب
      type:String
    }, 
    facilities:{
        type:String //ex: کافی شاپ، سرویس بهداشتی، نیمکت انتظار و غیره 
    },
    facilitiesEn:{
      type:String //ex: کافی شاپ، سرویس بهداشتی، نیمکت انتظار و غیره 
    },
    chargerTypes:{
        type:String   //ex: CHAdeMO, CCS1, AC0
    },

    //changed, compatible to server stationSpecs
    images:[
        {
            data: String, 
            contentType: String
        }
      ],
    address:{
      type:String
    },
    addressEn:{
      type:String
    }
  },
  createdAt: {
    type: Date
  },
  createdBy: {
    type: String
  },
  updatedAt: {
    type: Date
  },
  updatedBy: {
    type: String
  },
  reservable:{  
    type:Boolean
  }
});

module.exports = StationsSpecs = mongoose.model("OCPP_stationSpec", StationsSpecsSchema);