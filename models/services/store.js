const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StoreSchema = new Schema({
    province:{
        type: String
    },
    city: [{
        name:{
            type: String
        },
        position: [{
            storeName:{
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

module.exports = Store = mongoose.model('store', StoreSchema);