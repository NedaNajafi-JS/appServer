const mongoose = require('mongoose');
const { EuroChanged } = require('../../config/keys');
const Schema = mongoose.Schema;

const EuroChangedSchema = new Schema({
  lastValue: {
    type: Number
  },
  lastValueUsd: {
    type: Number
  },
  changeDate: {
    type: Date
  }
});

module.exports = EuroChangedModel = mongoose.model('eurochanged', EuroChangedSchema);