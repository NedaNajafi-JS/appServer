
var mongoose = require('mongoose'); 

var SliderSchema = new mongoose.Schema({ 

    title: String, 
    EnTitle: String,
    order: Number, 
    active: {
        type: Boolean,
        default: true
    },
    image: { 
        data: String
    },
    url: String
}); 

module.exports = new mongoose.model('services_slider', SliderSchema);