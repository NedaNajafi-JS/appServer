/**
 * Loading moment-jalaali module (npm i moment-jalaali)
 * loadPersian() function makes it possible to have the shamsi-date in persian string format
 * Exp. چهارشنبه 31 خرداد 1399
 */
var moment = require('moment-jalaali');
moment.loadPersian();
console.log(moment().format('jYYYY/jM/jD HH:mm'));
var mongoose = require('mongoose'); 
const { boolean } = require('@hapi/joi');

/**
 * Why not using separate document for tags?
 * reason: To filter files  by the tags in a performant way the right way is to store tags in the file document
 * instead of using populate, doe to this mongoDb fact "Store What You Query For".
 * http://thecodebarbarian.com/mongoose-schema-design-pattern-store-what-you-query-for.html
 */
var imageSchema = new mongoose.Schema({ 
    name: String, 
    title: String, 
    caption: String, 
    description: String, 
    reference: [String], 
    tags: [String], 
    news_date:{
        type:String,
        default: moment().format('jYYYY/jM/jD HH:mm')
    },
    create_date:{
        type:String,
        default: moment().format('jYYYY/jM/jD HH:mm')
    },
    files:[
        { 
            data: String, 
            contentType: String 
        } 
    ],
    comments:[
        { 
            text: String, 
            name: String ,
            email: String,
            date:{
                type:String,
                //default: moment().format('jYYYY/jM/jD HH:mm')
            },
            accepted: Boolean
        } 
    ],
    year: {
      type: String
    },
    month: {
      type: String
    },
    day: {
      type: String
    },
    gallery:[
        { 
            data: String,
            thumbnail: String
        } 
    ],
    url: String
}); 

module.exports = new mongoose.model('uploads', imageSchema);