const mongoose = require('mongoose');
const schema = mongoose.Schema;

const chargersLookupSchema = new schema({
    
        name: String,
        product_id: {
            type: schema.Types.ObjectId,
            ref: 'storechargers'
        },
        models:[{
            name: String, 
            sapcode: String,
            attrs:[String],
            price: Number
        }]
});

module.exports = chargersLookup = mongoose.model('chargersLookup', chargersLookupSchema);