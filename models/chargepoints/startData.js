const mongoose = require('mongoose');
const startDataSchema = mongoose.Schema({
    CPID: String,
    connector: String,
    RFID: String,
    status: {
        type: Number,
        default: 1,
        enum: [1, 2]
    },
    date: {
        type: Date,
        default: Date.now()
    }

});
module.exports = startDataModel = mongoose.model('startData', startDataSchema);