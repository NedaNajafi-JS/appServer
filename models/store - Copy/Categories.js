const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategoriesSchema = new Schema({
    name:{
        type: String,
        require: true
    },
    ENname:{
        type: String,
        require: true
    }
});

module.exports = Categories = mongoose.model("categories", CategoriesSchema);