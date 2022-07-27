
var mongoose = require('mongoose'); 

var TariffSchema = new mongoose.Schema({ 

    name: String, 
    Enname: String,
    info:[{
        price: {
            type: String,
        },
        description: { 
            type: String
        }
    }] 
    
}); 

module.exports = new mongoose.model('tariff', TariffSchema);