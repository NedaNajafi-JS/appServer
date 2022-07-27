const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const smartsocketProfileSchema = new Schema({

    name: {
        type: String
    },
    family: {
        type: String
    },
    cellNumber: {
        type: String
    },
    email:String,
    nationalcode: {
        type: String
    },
    address: {
        type: String,
     //   default:"",
    },
    postalCode: {
        type: String
    },
    purchaseDate: {
        type: Date
    },
    supportStatus:{//0:انتخاب نشده, 1: حل شده, 2: حل نشده
        type: String,
        default: "0"
    },
    responsed:{
        type:Boolean,
        default:false
    },
    date: {
        type: Date,
        default: Date.now
    },
    unread: {// 1: unread, 0: read
        type: Boolean,
        default:true
    }
});

module.exports = smartsocket_profile = mongoose.model("smartsocket_profile", smartsocketProfileSchema);
