
var mongoose = require('mongoose'); 

var cmsSliderSchema = new mongoose.Schema({ 

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

module.exports = new mongoose.model('slider', cmsSliderSchema);