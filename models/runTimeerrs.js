const mongoose = require('mongoose');

const errSchema = new mongoose.Schema({
    title: String,
    text: String,
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = errModel = mongoose.model('Errors', errSchema);