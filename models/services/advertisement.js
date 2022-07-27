
var mongoose = require('mongoose'); 

var advertismentSchema = new mongoose.Schema({ 

    name: String,  
    ENname: String,
    image:{ 
        data: String
    },
    url: String
}); 

module.exports = new mongoose.model('advertisment', advertismentSchema);