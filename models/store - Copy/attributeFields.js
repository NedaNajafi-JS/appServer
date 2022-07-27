const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fieldsSchema = new Schema({
    name:{
        type: String,
        require: true
    },
    title:String,
    values:[{
        name: String,
        title: String
    }]
});

module.exports = attributeField = mongoose.model("attributeField", fieldsSchema);