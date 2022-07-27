const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RCategoriesSchema = new Schema({
    name:{
        type: String,
        require: true
    }/*,
    ENname:{
        type: String,
        require: true
    }*/
});

module.exports = repair_Categories = mongoose.model("repair_categories", RCategoriesSchema);