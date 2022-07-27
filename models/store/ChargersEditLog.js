const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EditChargersSchema = new Schema({
    "productId":{
        type: Schema.Types.ObjectId,
        ref: 'storechargers',
        required: true
    },
    "field": String,
    "before": String,
    "after": String
});

module.exports = EditChargers = mongoose.model("logeditchargers", EditChargersSchema);