const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServicesSchema = new Schema({
    province:{
        type: String
    },
    city: [{
        name:{
            type: String
        },
        position: [{
            Name:{
                type: String
            },
            location: {
                coordinates: { 
                type: [Number]  //ex: [35.1232445,51.2342423]
                }
            }, 
            address: {
                type: String
            },
            phone: {
                type: String
            },
            website:{
                type:String
            },
            socialmedia: [{
                name:{
                    type: String
                },
                link: {
                    type: String
                }
            }]
        }]
    }]
});

module.exports = Services = mongoose.model('services', ServicesSchema);