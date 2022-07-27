const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var moment = require('moment-jalaali');
moment.loadPersian();
console.log(moment().format('jYYYY/jM/jD HH:mm'));

const WformSchema = new Schema({
    productName:{
        type: String,
        required:true
    },
    productModel :{
        type: String
    },
    productSerialNumber:{
        type: String,
        required:true
    },
    guaranteeNumber:{
        type: String,
        required:true
    },
    guaranteePeriod:{
        type: String,
        required:true
    },
    guaranteeImage:[
        { 
            data: String, 
            contentType: String 
        } 
    ],
    name:{
        type: String,
        required:true
    },
    familyName:{
        type: String,
        required:true
    },
    nationalCode:{
        type: String,
        required:true
    },
    mobile:{
        type: String,
        required:true
    },
    province:{
        type: String,
        required:true
    },
    city:{
        type: String,
        required:true
    },
    street:{
        type: String,
        required:true
    },
    postalCode:{
        type: String,
        required:true
    },
    address:{
        type: String,
        required:true
    },
    selectedDay:{
        type:String,
        default: moment().format('jYYYY/jM/jD HH:mm')
    },
    expireDay:{
        type:String,
        default: moment().format('jYYYY/jM/jD HH:mm')
    },
    unread: {// 1: unread, 0: read
        type: Boolean
    }
});

module.exports = warranty_form = mongoose.model('warranty_form', WformSchema);