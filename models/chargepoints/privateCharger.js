const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const privateChargerSchema = new Schema({
    name:String,
    serialNumber:String,
    pinCode:String,
    profileId: String,
    coordinates: { 
        type: [Number]  //ex: [35.1232445,51.2342423]
    }
});

module.exports = privateCharger = mongoose.model("test_privateCharger", privateChargerSchema);