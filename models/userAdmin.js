const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const userAdminSchema = new Schema({
  email: {
    type: String
  },
  password: {
    type: String
  },
  name: {
    type: String
  },
  phone: {
    type: String
  },
  username:{
    type: String
  },
  role:{
    type: String
  },
  uniqueId: String
});

module.exports = userAdmin = mongoose.model("userAdmin", userAdminSchema);
