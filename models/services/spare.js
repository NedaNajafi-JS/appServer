
var mongoose = require('mongoose'); 

var SpareSchema = new mongoose.Schema({ 

    name: String, 
    Enname: String,
    info:[{
        price: {
            type: String,
        },
        array:[{
            description: { 
                type: String
            }
        }]
    }],
    url: String,
    parentId: {
        type: String
    },
    image:[
        {
            data: String, 
            contentType: String
        }
    ]
    
}); 

module.exports = new mongoose.model('spare', SpareSchema);