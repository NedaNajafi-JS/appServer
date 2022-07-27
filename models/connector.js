const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConnectorSchema = new Schema({
  name: {
    type: String
  },
  vehicleType: {
    type: String
  },
  type: {
    type: String
  },
  exist: {
    type: String
  }
});

module.exports = Connector = mongoose.model('connector', ConnectorSchema);