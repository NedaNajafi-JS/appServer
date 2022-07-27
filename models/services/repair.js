const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var moment = require('moment-jalaali');
moment.loadPersian();
console.log(moment().format('jYYYY/jM/jD HH:mm'));

const RepairSchema = new Schema({
    productName:{
        type: String
    },
    productModel :{
        type: String
    },
    productCat: {
        type: String
    },
    supportingType:{
        type: String
    },
    productSerialNumber:{
        type: String
    },
    name:{
        type: String
    },
    familyName:{
        type: String
    },
    nationalCode:{
        type: String
    },
    mobile:{
        type: String
    },
    province:{
        type: String
    },
    city:{
        type: String
    },
    street:{
        type: String
    },
    postalCode:{
        type: String
    },
    address:{
        type: String
    },
    selectedDay:{
        day: {
            type: String
        },
        month :{
            type: String
        },
        year :{
            type: String
        }
    },
    selectedTime:{
        type: String
    },
    type: {// 1: repire, 2: installation
      type: Number
    },
    unread: {// 1: unread, 0: read
      type: Boolean
    }
});

module.exports = Repair = mongoose.model('repair', RepairSchema);