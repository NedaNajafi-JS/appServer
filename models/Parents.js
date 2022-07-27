const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ParentsSchema = new Schema({
  parentId: {
    type: String,
    required: true
  },
users:[{
  user:{
    type: String,
  },
}],
date: {
  type: Date,
  default: Date.now
}
});

module.exports = Parents = mongoose.model("parents",ParentsSchema);