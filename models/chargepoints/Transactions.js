const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ocpp_TransactionsSchema = new Schema({
    CPID: {
        type: String,
        required: true
    },
    stationId:{
        type:String,
        required: true
    },
    provinceId:{
        type:String
        //required: true
    },
    tariff:{
        type:Number,
        required:true,
        default: 200
    },
    connectorId:{
        type:Number,
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
    idTag: {
        type: String,
        maxLength: 20 ,
        required: true
    },
    idTagStop: {
        type: String,
        maxLength: 20 ,
        //required: true //TODO
    },
    transactionId: {
        type: Number,
        required: true,
        unique: true
    },
    reservationId:{
        type: Number
    },
    meterStart: {
        type: Number,
        required: true
    },
    meterStop: {
        type: Number
    },
    //  false => G2V , true => V2G
    V2G:{
        type:Boolean,
        required:true,
        default:false
    },
    timestampStart: {
        type: Date
    },
    timestampStop: {
        type: Date
    },
    reason: {
        type: String,
        enum: [
            "EmergencyStop",
            "EVDisconnected",
            "HardReset",
            "Local",
            "Other",
            "PowerLoss",
            "Reboot",
            "Remote",
            "SoftReset",
            "UnlockCommand",
            "DeAuthorized"
        ]
    },
    KWH:{
        type: Number
    },
    duration: {
        type: Number
    },
    chargerType:{
        type: String,
        enum: ["slow", "fast"]
    }
})
module.exports = ocpp_TransactionModel = mongoose.model('ocpp_Transaction', ocpp_TransactionsSchema);