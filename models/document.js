
var mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

var documentSchema = new mongoose.Schema({ 
    pishrane:[
        {
            title: String, 
            pdf: String
        }
    ],
    others:[
        {
            title: String, 
            pdf: String
        }
    ],
    video:[
        {
            title: String, 
            video: String
        }
    ],
    charger:[
        {
            title: String, 
            pdf: String
        }
    ]
});
module.exports = new mongoose.model('documents', documentSchema);