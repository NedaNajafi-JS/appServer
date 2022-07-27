
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ocpp_ChargePointSchema = new Schema({
    CPID: {
        type: String,
        required: true,
        unique: true
    },
    stationId:{
        type:String,
        required: true
    },
    provinceId:{
        type:String,
        required: true
    },
    chargerType:{
        type: String,
        enum: ["slow", "fast"]
    },
    usageType: {
        type: String,
        required: true,
        enum: ["public", "private"]  
    },
    currencyUnit:{
        type : String,
        enum: ["IR", "Usd"]
    },
    authenticationType: {
        type: Number,
        enum:[1,2,3]
        //1 for QR and RFID
        //2 for QR
        //3 for RFID 
    }
    ,
    connectorCount:{
        type:Number
    },
    tariff:{
        type:Number,
        required:true,
        default: 200
    },
    chargePointVendor: {
        type: String,
        maxLength: 20 ,
        required: true
    },
    chargePointModel: {
        type: String,
        maxLength: 20 ,
        required: true
    },
    chargePointSerialNumber: {
        type: String,
        maxLength: 25
    },
    chargeBoxSerialNumber: {
        type: String,
        maxLength: 25
    },
    firmwareVersion: {
        type: String,
        maxLength: 50
    },
    iccid: {
        type: String,
        maxLength: 20
    },
    imsi: {
        type: String,
        maxLength: 20
    },
    meterType: {
        type: String,
        maxLength: 25
    },
    meterSerialNumber: {
        type: String,
        maxLength: 25
    } ,
    status: {
        type: String,
        additionalProperties: false,
        enum: [
            "Available",
            "Unavailable",
            "Faulted"
        ]
    },
    isConnected:{
        type: Boolean,
        required:true,
        default:false
    },
    location: {
        type: {
          type: String, 
          enum: ['Point']
        },
        name :{
            type: String
        },
        nameEn :{
            type: String
        },
        coordinates: { 
          type: [Number]  //ex: [35.1232445,51.2342423]
        }
    }, 
    address: {
        type: String
    },
    keyConnector: [],
    connector: [{
        id: {
            type: Number,
            required: true
        },
        vehicleType: {
            type: String,
            enum: [
                "Car",
                "Motorcycle",
                "Bus"
            ]
        },
        connectorType: {
            type: String,
            enum: [
                "AC",
                "DC"
            ]
        },
        connectorName:{
            type: String,
            enum: [
                "Car-AC-Type1", 
                "Car-AC-Type2", 
                "Car-AC-GB/T", 
                "Car-DC-CHAdeMO",
                "Car-DC-GB/T",
                "Car-DC-CCS1",
                "Car-DC-CCS2",
                "Car-DC-Chaoji",
                "Motorcycle-AC-Type1",
                "Motorcycle-AC-Type2",
                "Motorcycle-AC-Default",
                "Bus-AC-Type2",
                "Bus-AC-GB/Ttype2",
                "Bus-DC-CCS2"
            ]
        },
        status: {
            type: String,
            enum: [
                "Notexist",
                "Available", 
                "Preparing",
                "Charging",
                "SuspendedEV",
                "SuspendedEVSE",
                "Finishing",
                "Reserved",
                "Unavailable",
                "Faulted"
            ],
            default: "Notexist"
        }
    }],
    isFree:{
        type:Boolean
    },
    specs: {
        description: {
          type: String
        },
        images: {
          type: String
        }
      }
    ,
    rfids: [],
    trackingCode: {
        type: String
    },
    ScheduledCharge:{
        type: Boolean
    },
    maxOfEnergy:{
        type:Number
    },
    createdAt: {
        type: Date
    }  
    ,createdBy: {
        type: String
    },
    name:String,
    serialNumber:String,
    pinCode:String,
    userPhone: String
})
module.exports = ocpp_ChargePoint = mongoose.model("test_ocpp_ChargePoint", ocpp_ChargePointSchema); 