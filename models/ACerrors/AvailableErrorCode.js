const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ocpp_AvailabilityErrorCodeSchema = new Schema({
    CPID: {
        type: String,
        required: true,
        //unique: true
    },
    stationId:{
        type:String,
        required: true
    },
    provinceId: {
        type: String,
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
    connectorId:{
        type: Number,
        required: true
    },
    timeStamp:{
        type: Date,
        required:true
    },
    packet:{
        type: String
    },
    validity:{
        type: Boolean,
        required: true
    },
    availability:{
        type: Boolean,
        required: true
    },
    chargerStatus:{
        type: Boolean,
        required: true
    }, 
    // restartStatus:{
    //     type: Boolean,
    //     required: true
    // },
    faulted:{
        type:Boolean,
        required : true
    },
    newError:{
        type: Array
    },
    currentError:{
        type:Array,
        required: true
    },
    last:{
        type:Boolean,
        required: true
    },
    errorsDetail:[
        {
            errorInfo:{
                type: String,
                required:true
            },
            start:{
                type: Date,
                required:true
            },
            stop:{
                type: Date
            }
        }
    ]
    
})
module.exports =ocpp_AvailabilityErrorCode = mongoose.model("ocpp_AvailabilityErrorCode", ocpp_AvailabilityErrorCodeSchema);