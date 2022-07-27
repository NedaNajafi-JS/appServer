const mongoose = require('mongoose');

const EVdataSchema = new mongoose.Schema({
    EVID: String,
    SOC: Number,
    SOH: Number,
    trip: Number,
    totalPackCycle: Number,
    batteryTemp: Number,
    batteryVoltage: Number,
    batteryFault: Boolean,
    // batteryFault:{
    //     type: Number,
    //     enum:[0,255]
    // },
    GPSX: Number,
    GPSY: Number,
    MCUFault: Boolean,
    // MCUFault:{
    //     type: Number,
    //     enum: [0,255]
    // },
    motorTemp: Number,
    MCUTemp: Number,
    EV_AC_charging: Boolean,
    EV_DC_charging: Boolean,
    DC_DC_fault: Boolean,
    OBC_fault: Boolean,
    HVACstatus: Boolean
});

module.exports = EVdata = mongoose.model('EVdata', EVdataSchema);