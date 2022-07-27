
var mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

/*var WarrantySchema = new mongoose.Schema({ 

    name: String, 
    Enname: String,
    image:[
        {
            data: String, 
            contentType: String
        }
    ],
    warranty:[
        {
            data: String, 
            contentType: String
        }
    ],
    
}); 

module.exports = new mongoose.model('warranties', WarrantySchema);*/

var WarrantySchema = new mongoose.Schema({ 
    name:{
        type: String,
        require: true
    },
    active:{
        type: Boolean,
        default:0 //0 is not active, 1 is active
    },
    activeform:{
        type: Boolean,
        default:0 //0 is not active, 1 is active
    },
    image:[
        {
            data: String, 
            contentType: String
        }
    ],
    warranty:[
        {
            data: String, 
            contentType: String
        }
    ],
    url:String
});
module.exports = new mongoose.model('warranties', WarrantySchema);