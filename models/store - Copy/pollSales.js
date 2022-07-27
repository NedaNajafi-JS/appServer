const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SalesSchema = new Schema({
    number:{
        type:Number
    },
    question: {
        type: String
    },
    answers: [{
        number:{
            type:Number
        },
        text:{
            type:String
        },
        selected:{
            type: Boolean,
            default: false
        }
    }],
    selectedQuestion:{
        type:Boolean,
        default: false
    }
});

module.exports = Sales = mongoose.model('sales', SalesSchema);