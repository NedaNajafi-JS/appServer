const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appConfigSchema = new Schema({
  version: {
    type: String,
  }
});
module.exports = appConfig = mongoose.model('appConfig', appConfigSchema);