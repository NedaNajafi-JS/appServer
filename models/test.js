const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testSchema = new Schema({
  name: String,
  number: Number
});

module.exports = test  = mongoose.model("test", testSchema);
