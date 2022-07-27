const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var moment = require('moment-jalaali');
moment.loadPersian();
console.log(moment().format('jYYYY/jM/jD HH:mm'));

const AformSchema = new Schema({
    companyName:{
        type: String
    },
    resume :{
        type: String
    },
    employeeNumber:{
        type: String
    },
    workplaceArea:{
        type: String
    },
    facilities:{
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
    phone:{
        type: String
    },
    province:{
        type: String
    },
    passedCourses:{
        type: String
    },
    email:{
        type: String
    },
    city:{
        type: String
    },
    address:{
        type: String
    },
    acceptForm:{
        type:Boolean
    },
    permission:{
        type: String
    },
    otherPermission:{
        type: String
    },
    workplaceStatus:{
        type: String
    },
    agencyType:{
        type: String
    },
    unread: {// 1: unread, 0: read
        type: Boolean
    },
    companyAddress: {
        type: String
    },
    day: {
        type: String
    },
    month: {
        type: String
    },
    year: {
        type: String
    },
    workplacePosession: {
        type: String
    },
    trackingCode: {
        type: String
    },
    userType:{
        type: String
    },
    date:{
        type:Date,
        default:Date.now
    }
});

module.exports = agency_form = mongoose.model('agency_form', AformSchema);