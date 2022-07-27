const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StoreChargersSchema = new Schema({
    parentId: {
        type: String
    },
    name:{
        type: String,
        require: true
    },
    ENname:{
        type: String,
        require: true
    },
    product_model:{
        type: String
    },
    active:{
        type: Boolean,
        default: false
    },
    activeproduct:{
        type: Boolean,
        default: false
    },
    hide:{
        type: Boolean,
        default: false
    },
    properties:{
        type:[{
            name:{
                type: String//,
                //require: true
            },
            title:{
                type: String//,
                //require: true
            },
            ENtitle:{
                type: String//,
                //require: true
            },
            value:{
                type: String//,
                //require: true
            }, 
            ENvalue:{
                type: String//,
                //require: true
            }, 
            categoryId:{
                type: Schema.Types.ObjectId,
                ref: 'category'
            }
        }],
        default:undefined,
        required: false
    },
    features:{
        type: [{
            value:{
                type: String
            },
            ENvalue:{
                type: String
            }
        }],
        default:undefined,
        required: false
    }, 
    attributes:{
        type: [{
            name:{
                type: String//,
                //require: true
            },
            title:{
                type: String//,
                //require: true
            },
            ENtitle:{
                type: String//,
                //require: true
            },
            force: Boolean,
            valid: Boolean,
            values:[{
                //equal_id: Schema.Types.ObjectId,
                name:{
                    type: String//,
                    //require: true
                },
                ENname:{
                    type: String//,
                    //require: true
                },
                // price:{
                //     type: String//,
                //     //require: true
                // },
                title:{
                    type: String//,
                    //require: true
                },
                ENtitle:{
                    type: String//,
                    //require: true
                },
                isDefault: Boolean/*,
                related_id:{
                    type: String
                },
                attribute_related_id:{
                    type: String
                }*/
            }],
        }],
        default:undefined,
        required: false
    },
    image:[
        {
            data: String, 
            contentType: String
        }
    ],
    model:{
        type: [
            {
                data: String, 
                contentType: String
            }
        ],
        default:undefined,
        required: false
    },
    review:{
        type: [
            {
                description: {
                    type: String
                },
                date: {
                    type: Date
                },
                profileID:{
                    type: Schema.Types.ObjectId,
                    ref: 'profile'
                },
                confirmed: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        default:undefined,
        required: false
    },
    price:{
        type: String//,
        //require: true
    },
    afterdiscount:{
        type: String//,
        //require: true
    },
    discount:{
        type: String//,
        //require: true
    },
    deliveryPrice: {
        type: Number,
        default: 0
    },
    InstallationPrice: {
        type: Number,
        default: 0
    },
    FAQ:{
        type: [{
            question:{
                type: String
            },
            answer:{
                type: String
            }
        }],
        default:undefined,
        required: false
    },
    ENfaq:{
        type: [{
            question:{
                type: String
            },
            answer:{
                type: String
            }
        }],
        default:undefined,
        required: false
    },
    description: String,
    ENdescription: String,
    descriptionproduct: String,
    ENdescriptionproduct: String,
    shortdescription: {
        type: [String],
        default:undefined,
        required: false
    },
    ENshortdescription: {
        type: [String],
        default:undefined,
        required: false
    },
    profit: {
        type: Number,
        default: 0
    },
    UploadDoc:{
        type: Boolean,
        default: true
    },
    catalog:{
        type: [
            {
                data: String, 
                contentType: String
            }
        ],
        default: undefined,
        required: false
    },
    ENcatalog:{
        type: [
            {
                data: String, 
                contentType: String
            }
        ],
        default:undefined,
        required: false
    },
    userManual:{
        type: [
            {
                data: String, 
                contentType: String
            }
        ],
        default:undefined,
        required: false
    },
    ENuserManual:{
        type: [
            {
                data: String, 
                contentType: String
            }
        ],
        default:undefined,
        required: false
    },
    installationarea:{
        type: [
            {
                name: String,
                title: String,
                ENtitle: String
            }
        ],
        default:undefined,
        required: false
    },
    order: Number,
    status: Number
});

module.exports = StoreChargers = mongoose.model("storechargers", StoreChargersSchema);