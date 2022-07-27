const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lastPacketInfoSchema = new Schema({
    CPID: {
        type: String,
        required: true,
        //unique: true
    },
    stationId:{
        type:String,
        required: true
    },
    transactionId:{
        type: String,
        required: true,
        unique: true
    },
    connectorType:{
        type: String,
        required: true
    },
    connectorModel:{
        type:String
    },
    start:{
        type: Date
    },
    stop:{
        type: Date
    },
    timeStamp:{
        type: Date,
        required:true
    },
    validity:{
        type: Boolean,
        required: true
        //1=CHAdeMO, 0=ocpp(irani)
    },
    lastPacket:{
        type: String
    }
    ,
    errorList: [] 
})
module.exports = ocpp_lastPacketInfo = mongoose.model("ocpp_lastPacketInfo", lastPacketInfoSchema);