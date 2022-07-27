/**
 * use express module
 * require contact schema
 * require email page
 */
const categories = require('../../../models/store/Categories');
const chargerProductModel = require('../../../models/store/Chargers');
const express = require('express');
const router = express();
const multer = require('multer');
const axios = require('axios');
const keys = require('../../../config/keys');
const lastEuro = require('../../../models/store/EuroChanged');

/**
 * Save complaint form information
 */
router.post('/Category/insert',async (req,res)=>{
    /*const {
        errors,
        isValid
    } = validateComplaintInput(req.body);
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }*/

    /*const charger_info = {};
    complaint_info.name = req.body.name;
    complaint_info.phone = req.body.phone;
    complaint_info.email = req.body.email; 
    complaint_info.subject = req.body.subject;
    complaint_info.message = req.body.message;

    new categories(complaint_info).save()
    .then(user => { 
        res.status(200).send("ذخیره با موفقیت انجام شد")
    })
    .catch(err => res.json(err));*/

    const category = new categories({
        name: req.body.name
    });
    category.save().then(Category => res.json(Category)).catch(err => res.status(404).json(err));
})
/**
 * Save complaint form information
 */
router.post('/Charger/insert',async (req,res)=>{
    /*const {
        errors,
        isValid
    } = validateComplaintInput(req.body);
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }*/
    let properties = [];
    let property_info = {};
    if (req.body.properties != undefined) {
        for (var i = 0; i < req.body.properties.length; i++) {
            property_info = {};
            property_info.name = req.body.properties[i].name;
            property_info.title = req.body.properties[i].title;
            property_info.value = req.body.properties[i].value; 
            property_info.categoryId = req.body.properties[i].categoryId;
            properties.push(property_info);
        }
    }
    let attributes = [];
    let attribuet_info = {};
    let values = [];
    let value_info = {};
    if (req.body.attributes != undefined) {
        for (var i = 0; i < req.body.attributes.length; i++) {
            attribuet_info = {};
            attribuet_info.name = req.body.attributes[i].name;
            attribuet_info.title = req.body.attributes[i].title;
            attribuet_info.force = req.body.attributes[i].force;
            attribuet_info.valid = req.body.attributes[i].valid;
            values = [];
            value_info = {};
            for (var j = 0; j < req.body.attributes[i].value.length; j++) {
                value_info = {};
                value_info.name = req.body.attributes[i].value[j].name;
                value_info.title = req.body.attributes[i].value[j].title; 
                //value_info.price = req.body.attributes[i].value[j].price; 
                value_info.isDefault = req.body.attributes[i].value[j].isDefault; 
                //value_info.attribute_related_id = req.body.attributes[i].value[j].attribute_related_id; 
                //value_info.related_id = req.body.attributes[i].value[j].related_id; 
                values.push(value_info);
            }
            attribuet_info.values = values;
            attributes.push(attribuet_info);
        }
    }
    let features = [];
    let feature_info = {};
    if (req.body.features != undefined) {
        for (var i = 0; i < req.body.features.length; i++) {
            feature_info = {};
            feature_info.value = req.body.features[i].value;
            features.push(feature_info);
        }
    }
    let faqes = [];
    let faq_info = {};
    if (req.body.FAQ != undefined) {
        for (var q = 0; q < req.body.FAQ.length; q++) {
            faq_info = {};
            faq_info.question = req.body.FAQ[q].question;
            faq_info.answer = req.body.FAQ[q].answer;
            faqes.push(faq_info);
        }
    }
    let image = [];
    let image_info = {};
    if (req.body.image != undefined) {
        for (var q = 0; q < req.body.image.length; q++) {
            image_info = {};
            image_info.data = req.body.image[q].data;
            image_info.contentType = req.body.image[q].contentType;
            image.push(image_info);
        }
    }
    let model = [];
    let model_info = {};
    if (req.body.model != undefined) {
        for (var q = 0; q < req.body.model.length; q++) {
            model_info = {};
            model_info.data = req.body.model[q].data;
            model_info.contentType = req.body.model[q].contentType;
            model.push(image_info);
        }
    }
    const newchargers = new chargerProductModel({
        parentId: req.body.parentId,
        name: req.body.name,
        product_model: req.body.product_model,
        active: req.body.active,
        properties: properties,
        attributes: attributes,
        price: req.body.price,
        discount: req.body.discount,
        afterdiscount: req.body.afterdiscount,
        features: features,
        FAQ: faqes,
        image: image,
        description: req.body.description,
        model: model,
        profit: req.body.profit
      });
      newchargers.save().then(() => res.json(station)).catch(err => res.json(err));
})

/**
 * Save complaint form information
 */
router.post('/Charger/Edit', async (req, res) => {
    /*const {
        errors,
        isValid
    } = validateComplaintInput(req.body);
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }*/


    const Fields = {};
    if (req.body.parentId) Fields.parentId = req.body.parentId;
    if (req.body.name) Fields.name = req.body.name;
    if (req.body.active) Fields.active = req.body.active;
    if (req.body.price) Fields.price = req.body.price;
    if (req.body.discount) Fields.discount = req.body.discount;
    if (req.body.afterdiscount) Fields.afterdiscount = req.body.afterdiscount;
    let properties = [];
    let property_info = {};
    if (req.body.properties != undefined) {
        for (var i = 0; i < req.body.properties.length; i++) {
            property_info = {};
            property_info.name = req.body.properties[i].name;
            property_info.title = req.body.properties[i].title;
            property_info.value = req.body.properties[i].value; 
            property_info.categoryId = req.body.properties[i].categoryId;
            properties.push(property_info);
        }
        Fields.properties = properties;
    }
    let attributes = [];
    let attribuet_info = {};
    let values = [];
    let value_info = {};
    if (req.body.attributes != undefined) {
        for (var i = 0; i < req.body.attributes.length; i++) {
            attribuet_info = {};
            attribuet_info.name = req.body.attributes[i].name;
            attribuet_info.title = req.body.attributes[i].title;
            values = [];
            value_info = {};
            for (var j = 0; j < req.body.attributes[i].value.length; j++) {
                value_info = {};
                value_info.name = req.body.attributes[i].value[j].name;
                value_info.price = req.body.attributes[i].value[j].price; 
                values.push(value_info);
            }
            attribuet_info.values = values;
            attributes.push(attribuet_info);
        }
        Fields.attributes = attributes;
    }
    let features = [];
    let feature_info = {};
    if (req.body.features != undefined) {
        for (var i = 0; i < req.body.features.length; i++) {
            feature_info = {};
            feature_info.value = req.body.features[i].value;
            features.push(feature_info);
        }
        Fields.features = features;
    }
    let faqes = [];
    let faq_info = {};
    if (req.body.faqes != undefined) {
        for (var q = 0; q < req.body.faqes.length; q++) {
            faq_info = {};
            faq_info.question = req.body.faqes[q].question;
            faq_info.answer = req.body.faqes[q].answer;
            faqes.push(faq_info);
        }
        Fields.FAQ = faqes;
    }
    chargerProductModel.findOne({
        "_id": req.body.id
      }).then(charger => {
        if (charger) {
            chargerProductModel.findOneAndUpdate({
            "_id": req.body.id
          }, {
            $set: Fields
          }, {
            new: true
          }).then(charger => res.json(charger)).catch(err => res.json(err));
        }
      });
})


router.get('/getChargers', async (req, res) => {

    let uero = await lastEuro
            .find()
            .exec();

    let EuroVal = uero[0].lastValue;
    if (keys.EuroVal && parseInt(keys.EuroVal) > 0) {
        EuroVal = keys.EuroVal;
    }
	let resp = await chargerProductModel.find(
        // {
		//     active: true
        // }
    )
        .sort({ order: 1 })
    .lean()
    .exec();

	//.then(async (resp) => {
    if (resp) {
        let Chargers = [];
        let parent_Models = [];
        let parent_Chargers = [];
        await Promise.all(resp.map(async (resp1) => {

            if (parseInt(resp1.parentId) != 0) {
                if (resp1.product_model == undefined || resp1.product_model == "" || resp1.product_model == '') {
                    await chargerProductModel.findOne({
                        "_id": resp1.parentId
                    })
                    .then(async (parent) => {
                            if (parent) {
                            //console.log("ok")
                                resp1.parent_name = parent.name;
                                resp1.parent_ENname = parent.ENname;
                            resp1.productID = resp1._id;
                            parent_Models.push(resp1)
                        }
                    })
                    .catch(err => {
                        return res.status(404).json(err);
                    });
                }
                else {
                    resp1.parent_name = resp1.name;
                    resp1.parent_ENname = resp1.ENname;
                    resp1.productID = resp1._id;
                    Chargers.push(resp1)
                }
            }
            else
                parent_Chargers.push(resp1)
        }));
        let array = [];
        let childs = [];
        let childs_Model = [];
        let charger_obj = {};
        let charger_model_obj = {};
        for (var j = 0; j < parent_Chargers.length; j++) {
            charger_obj = {};
            childs = [];
            charger_obj.parent_name = parent_Chargers[j].name;
            charger_obj.parent_ENname = parent_Chargers[j].ENname;
            charger_obj.active = parent_Chargers[j].active;
            if (parent_Chargers[j].hide !== undefined && parent_Chargers[j].hide === true) {
                charger_obj.hide = true;
            } else {
                charger_obj.hide = false;
            }
            charger_obj.parent_id = parent_Chargers[j]._id;
           
            let new_files = [];
            if (parent_Chargers[j].image) {
                for (var k = 0; k < parent_Chargers[j].image.length; k++) {
                // parent_Chargers[j].image[k].files.forEach(file => {
                        let new_file = {};//Object.assign({}, file);
                        
                    if (parent_Chargers[j].image[k].data !== undefined) {
                            //remove public from path
                            parent_Chargers[j].image[k].data = parent_Chargers[j].image[k].data.slice(6);
                        }
                        
                        new_file.data = parent_Chargers[j].image[k].data;
                        //new_file.contentType = parent_Chargers[j].image[k].contentType;
                        new_file._id = parent_Chargers[j].image[k]._id;

                        new_files.push(new_file);
                    //});
                }
            }
            charger_obj.images = new_files;
            for (var i = 0; i < parent_Models.length; i++) {
                if (parent_Chargers[j]._id == parent_Models[i].parentId) {
                   
                    childs_Model = [];
                    let new_files_child = [];

                    //let new_files = [];

                    if (parent_Models[i].price && parent_Models[i].profit) {
                        parent_Models[i].price = Math.round((parseFloat(parent_Models[i].price) * parseFloat(parent_Models[i].profit) * parseInt(EuroVal)) / 1000) * 1000;
                    }

                    if (parent_Models[i].afterdiscount && parent_Models[i].profit) {
                        parent_Models[i].afterdiscount = Math.round((parseFloat(parent_Models[i].afterdiscount) * parseFloat(parent_Models[i].profit) * parseInt(EuroVal)) / 1000) * 1000;
                    }
                    
                    if (parent_Models[i].price === null) {
                        parent_Models[i].price = 0;
                    }

                    if (parent_Models[i].afterdiscount === null) {
                        parent_Models[i].afterdiscount = 0;
                    }

                    if (parent_Models[i].attributes !== undefined) {
                        for (var k = 0; k < parent_Models[i].attributes.length; k++) {

                            parent_Models[i].attributes[k].values.map(pr_attr => {
                                pr_attr.price = Math.round((parseFloat(pr_attr.price) * parseFloat(parent_Models[i].profit) * parseInt(EuroVal)) / 1000) * 1000;
                                if (pr_attr.price === null || pr_attr.price === '') {
                                    pr_attr.price = 0;
                                }
                            });
                        }
                    }
                    
                    if (parent_Models[i].image) {
                        for (var q = 0; q < parent_Models[i].image.length; q++) {
                            //Chargers[i].image[q].files.forEach(file_ => {
                                let new_files = {};//Object.assign({}, file);
                                
                            if (parent_Models[i].image[q].data !== undefined) {
                                    //remove public from path
                                    parent_Models[i].image[q].data = parent_Models[i].image[q].data.slice(6);
                                }
                                
                                new_files.data = parent_Models[i].image[q].data;
                                new_files.contentType = parent_Models[i].image[q].contentType;
                                new_files._id = parent_Models[i].image[q]._id;
            
                                new_files_child.push(new_files);
                        // });
                        }
                    }
                    parent_Models[i].images=new_files_child;
                    
                     //catalog
                    if(parent_Models[i].catalog !== undefined){
                        for(var l=0; l<parent_Models[i].catalog.length; l++){
                            if(parent_Models[i].catalog[l].data !== undefined)
                            parent_Models[i].catalog[l].data = parent_Models[i].catalog[l].data.slice(6);
                        }
                    }

                    //ENcatalog
                    if(parent_Models[i].ENcatalog !== undefined){
                        for(var l=0; l<parent_Models[i].ENcatalog.length; l++){
                            if(parent_Models[i].ENcatalog[l].data !== undefined)
                            parent_Models[i].ENcatalog[l].data = parent_Models[i].ENcatalog[l].data.slice(6);
                        }
                    }

                    //user Manual
                    if(parent_Models[i].userManual !== undefined){
                        for(var f=0; f<parent_Models[i].userManual.length; f++){
                            if(parent_Models[i].userManual[f].data !== undefined)
                            parent_Models[i].userManual[f].data = parent_Models[i].userManual[f].data.slice(6);
                        }
                    }

                    for(var t=0; t<Chargers.length; t++) {
                        if(parent_Models[i]._id==Chargers[t].parentId) {
                            let new_files_child = [];
                            Chargers[t].price = Math.round((parseFloat(Chargers[t].price) * parseFloat(Chargers[t].profit) * parseInt(EuroVal)) / 1000) * 1000;
                            Chargers[t].afterdiscount = Math.round((parseFloat(Chargers[t].afterdiscount) * parseFloat(Chargers[t].profit) * parseInt(EuroVal)) / 1000) * 1000;
                            
                            if (Chargers[t].price === null || Chargers[t].price === '' || Chargers[t].price === undefined) {
                                Chargers[t].price = 0;
                            }
                            if (Chargers[t].afterdiscount === null || Chargers[t].afterdiscount === '' || Chargers[t].afterdiscount === undefined) {
                                Chargers[t].afterdiscount = 0;
                            }

                            if (Chargers[t].attributes) {
                                for (var k = 0; k < Chargers[t].attributes.length; k++) {
        
                                    Chargers[t].attributes[k].values.map(pr_attr => {
                                        pr_attr.price = Math.round((parseFloat(pr_attr.price) * parseFloat(Chargers[t].profit) * parseInt(EuroVal)) / 1000) * 1000;
                                        if (pr_attr.price === null || pr_attr.price === '' || pr_attr.price === undefined) {
                                            pr_attr.price = 0;
                                        }
                                    });
                                }
                            }
                            

                            if (Chargers[t].image) {
                                for (var l = 0; l < Chargers[t].image.length; l++) {
                                    //Chargers[i].image[q].files.forEach(file_ => {
                                        let new_file_child = {};//Object.assign({}, file);
                                        
                                    if (Chargers[t].image[l].data !== undefined) {
                                            //remove public from path
                                            Chargers[t].image[l].data = Chargers[t].image[l].data.slice(6);
                                        }
                                        
                                        new_file_child.data = Chargers[t].image[l].data;
                                        new_file_child.contentType = Chargers[t].image[l].contentType;
                                        new_file_child._id = Chargers[t].image[l]._id;
                    
                                        new_files_child.push(new_file_child);
                                // });
                                }
                            }

                            //catalog
                            if (Chargers[t].catalog !== undefined) {
                                for (var l = 0; l < Chargers[t].catalog.length; l++) {
                                    if (Chargers[t].catalog[l].data !== undefined)
                                        Chargers[t].catalog[l].data = Chargers[t].catalog[l].data.slice(6);
                                }
                            }

                            //ENcatalog
                            if (Chargers[t].ENcatalog !== undefined) {
                                for (var l = 0; l < Chargers[t].ENcatalog.length; l++) {
                                    if (Chargers[t].ENcatalog[l].data !== undefined)
                                        Chargers[t].ENcatalog[l].data = Chargers[t].ENcatalog[l].data.slice(6);
                                }
                            }

                            //usermanual
                            if (Chargers[t].usermanual !== undefined) {
                                for (var l = 0; l < Chargers[t].usermanual.length; l++) {
                                    if (Chargers[t].usermanual[l].data)
                                        Chargers[t].usermanual[l].data = Chargers[t].usermanual[l].data.slice(6);
                                }
                            }

                            Chargers[t].images = new_files_child;

                            if (Chargers[t].price === null) {
                                Chargers[t].price = 0;
                            }
                            //console.log(Chargers[t].afterdiscount)
                            if (Chargers[t].afterdiscount === null || Chargers[t].afterdiscount === undefined) {
                                Chargers[t].afterdiscount = 0;
                            }

                            if (Chargers[t].discount === null) {
                                Chargers[t].discount = 0;
                            }

                            if (Chargers[t].deliveryPrice === null) {
                                Chargers[t].deliveryPrice = 0;
                            }

                            if (Chargers[t].InstallationPrice === null) {
                                Chargers[t].InstallationPrice = 0;
                            }

                            childs_Model.push(Chargers[t]);
                        }
                    }
                    parent_Models[i].childs = childs_Model;
                    childs.push(parent_Models[i]);
                }
                //childs_Model.push(parent_Models[i]);
            }
            childs.sort((item1, item2) => item1.order < item2.order ? -1 : 1)
            charger_obj.childs = childs;
            array.push(charger_obj);
        }
            
		return res.status(200).send(array)
	}//)
	// .catch(err => res.status(404).json(err));

});

/**
 * cb is multer's callback. The first argument is the error 
 * and the next argument specifies if everything went ok(true) or not(false).
 */

multer({
    dest: keys.appDir + '/public/images/'
});
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, keys.appDir + '/public/images/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }, fileFilter: (req, file, cb) => {

        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {

            cb(null, true);

        } else {

            req.fileValidationError = 'فرمت فایل صحیح نمی‌باشد';
            const error = new Error('فرمت فایل صحیح نمی‌باشد');
            return cb(error, false);
        }
    }
});

let upload = multer({ storage: storage });
  
router.get('/docHTML', function (req, res) {
      res.sendFile(__dirname + '/charger.html');
  
});
  
router.post('/img/upload', upload.array('myImage', 10), async (req, res) => {
    let files_to_save = [];
    req.files.map(file => {
        if (file.size > 5000000)
            res.send('حجم فایل نباید بیشتر از 5 مگابایت باشد');
    
            let dataPath = '';
            var splitted = file.path.split(keys.lastDir);
        if (splitted[1])
                dataPath = splitted[1];
        else {
                dataPath = file.path;
            }

        const file_ = {
          data: dataPath,//file.path,
          contentType: file.mimetype
        }
  
        files_to_save.push(file_);
    });
  
    if (files_to_save.length > 0) {

        chargerProductModel
        .findOneAndUpdate(
            {
                "_id": req.body.chargerId
            },
            {
                    $push: { image: files_to_save }
            }
        )
        .then((Charger) => {
                if (Charger) {
                return res.status(200).send(Charger);
                } else {
                return res.status(400).json('کالایی با این مشخصات یافت نشد');
            }
        })
            .catch(err => {
            return res.status(400).json(err);
        });
        
    } else {
      res.status(200).json('success');
    }
});

router.post('/', async (req, res) => {

    //let resAPI = await axios.get('http://api.navasan.tech/latest/?api_key=vYLyHkr2yCP7pdJH0qv9I7Rhoxo1vc8r&item=eur')
    //console.log(resAPI, resAPI.data.eur.value);
    let uero = await lastEuro
            .find()
            .exec();

    let EuroVal = uero[0].lastValue;
    if (keys.EuroVal && parseInt(keys.EuroVal) > 0) {
        EuroVal = keys.EuroVal;
    }
    let Chargers;
    let charger = await chargerProductModel.findOne(
        {
            "_id": req.body.id
        }
    )
    .lean()
    .exec();
    //.then(async (charger) => {
        let similars = {};

    if (charger) {

        if (charger.properties !== undefined && charger.properties.length > 0) {
                
                let catMap = {};//new Map();
            await Promise.all(charger.properties.map(async (ch) => {

                if (ch.categoryId !== undefined) {

                        const cat = await categories.findById(ch.categoryId);
                    if (cat !== undefined && cat !== null) {

                        if (catMap[cat.name] === undefined/*!catMap.has(cat.name)*/) {

                                catMap[cat.name] = {};
                                catMap[cat.name].ENname = '';
                                catMap[cat.name].list = [];
                                //catMap.set(cat.name, []);
                            }
                            
                            catMap[cat.name].ENname = cat.ENname;
                            catMap[cat.name].list.push(ch);
                            //catMap.get(cat.name).push(ch);
                        }
                    }
                }));

            if (catMap !== undefined) {
                    charger.groupedProperties = [];
                Object.keys(catMap).forEach(function (key) {
                        let proObj = {
                            title: key,
                            ENtitle: catMap[key].ENname,
                            list: catMap[key].list
                        }
                        charger.groupedProperties.push(proObj);

                    });
                    //charger.groupedProperties = catMap;//Object.fromEntries(catMap);
                }
            
            }

            //find childs
            let childs = await chargerProductModel.find({
                "parentId": charger._id
            })
            .lean()
            .exec();

        if (childs && childs.length > 0) {

                
                await Promise.all(childs.map(child => {
                if (child.image) {
                    for (var q = 0; q < child.image.length; q++) {
                        if (child.image[q].data !== undefined)
                                child.image[q].data = child.image[q].data.slice(6);
                        }
                    }

                    //catalog
                if (child.catalog !== undefined) {
                    for (var l = 0; l < child.catalog.length; l++) {
                        if (child.catalog[l].data !== undefined)
                                child.catalog[l].data = child.catalog[l].data.slice(6);
                        }
                    }

                    //ENcatalog
                if (child.ENcatalog !== undefined) {
                    for (var l = 0; l < child.ENcatalog.length; l++) {
                        if (child.ENcatalog[l].data !== undefined)
                                child.ENcatalog[l].data = child.ENcatalog[l].data.slice(6);
                        }
                    }

                    //usermanual
                if (child.usermanual !== undefined) {
                    for (var l = 0; l < child.usermanual.length; l++) {
                        if (child.usermanual[l].data !== undefined)
                                child.usermanual[l].data = child.usermanual[l].data.slice(6);
                        }
                    }
                }));
                charger.childs = childs;
            }

            charger.productID = charger._id;
            Chargers = charger;

        if (charger.image) {
            for (var q = 0; q < charger.image.length; q++) {
                if (charger.image[q].data !== undefined)
                        // remove "public" from the path. public is static folder and does not need to be included in path
                        charger.image[q].data = charger.image[q].data.slice(6);
                }
            }

        if (charger.model) {
            for (var r = 0; r < charger.model.length; r++) {
                if (charger.model[r].data !== undefined)
                        // remove "public" from the path. public is static folder and does not need to be included in path
                        charger.model[r].data = charger.model[r].data.slice(6);
                }
            }

            //catalog
        if (charger.catalog !== undefined) {
            for (var l = 0; l < charger.catalog.length; l++) {
                if (charger.catalog[l].data !== undefined)
                        charger.catalog[l].data = charger.catalog[l].data.slice(6);
                }
            }

            //ENcatalog
        if (charger.ENcatalog !== undefined) {
            for (var l = 0; l < charger.ENcatalog.length; l++) {
                if (charger.ENcatalog[l].data !== undefined)
                        charger.ENcatalog[l].data = charger.ENcatalog[l].data.slice(6);
                }
            }

            //usermanual
        if (charger.usermanual !== undefined) {
            for (var l = 0; l < charger.usermanual.length; l++) {
                if (charger.usermanual[l].data !== undefined)
                        charger.usermanual[l].data = charger.usermanual[l].data.slice(6);
                }
            }

        if (charger.price !== undefined && charger.profit !== undefined) {
            charger.price = Math.round((parseFloat(charger.price) * parseFloat(charger.profit) * parseInt(EuroVal)) / 1000) * 1000;
        } else {
                charger.price = 0;
            }

        if (charger.afterdiscount !== undefined && charger.profit !== undefined) {
            charger.afterdiscount = Math.round((parseFloat(charger.afterdiscount) * parseFloat(charger.profit) * parseInt(EuroVal)) / 1000) * 1000;
        } else {
                charger.afterdiscount = 0;
            }
            
        if (charger.attributes !== undefined) {

                let attrs = [];
            for (var k = 0; k < charger.attributes.length; k++) {

                if (charger.attributes[k].force === true) {

                    charger.attributes[k].values.map(async (pr_attr) => {
                        
                        if (pr_attr.isDefault === true) {

                                attrs.push({
                                    value: pr_attr.name
                                });

                            }

                        });
                    }

                }

            if (attrs.length > 0) {

                    let product = await chargersLookup
                    .findOne({
                        product_id: req.body.id
                    })
                    .exec();

                    let inputAttrs = [];

                    await Promise.all(attrs.map(attr => {
                        inputAttrs.push(attr.value);
                    }));

                if (product) {

                        let price = 0;
                        let exists = false;

                        await Promise.all(product.models.map(mdl => {
                        if (arraysEqual(inputAttrs, mdl.attrs) === true) {
                                price = mdl.price;
                                exists = true;
                            }
                        }));

                    if (exists === true) {

                        if (charger.profit === 0) {
                                charger.profit = 1;
                            }
                                
                        charger.price = Math.round((parseFloat(price) * parseFloat(charger.profit) * parseInt(EuroVal)) / 1000) * 1000;
                            charger.afterdiscount = parseInt(charger.price) - (parseInt(charger.price) * (charger.discount / 100));

                        }

                    }
                }
            }
            
            //similar products
            similars = await chargerProductModel
            .find(
                {
                    parentId: charger.parentId,
                    _id: { $ne: charger._id }
                }
            )
            .lean()
            .exec();

            await Promise.all(
                similars.map(async (similar) => {
                    similar.productID = similar._id;
                if (similar.image) {
                    for (var q = 0; q < similar.image.length; q++) {
                        if (similar.image[q].data !== undefined)
                                // remove "public" from the path. public is static folder and does not need to be included in path
                                similar.image[q].data = similar.image[q].data.slice(6);
                        }
                    }

                if (similar.model) {
                    for (var r = 0; r < similar.model.length; r++) {
                        if (similar.model[r].data !== undefined)
                                // remove "public" from the path. public is static folder and does not need to be included in path
                                similar.model[r].data = similar.model[r].data.slice(6);
                        }
                    }
                    
                    //catalog
                if (similar.catalog !== undefined) {
                    for (var l = 0; l < similar.catalog.length; l++) {
                        if (similar.catalog[l].data !== undefined)
                                similar.catalog[l].data = similar.catalog[l].data.slice(6);
                        }
                    }

                    //ENcatalog
                if (similar.ENcatalog !== undefined) {
                    for (var l = 0; l < similar.ENcatalog.length; l++) {
                        if (similar.ENcatalog[l].data !== undefined)
                                similar.ENcatalog[l].data = similar.ENcatalog[l].data.slice(6);
                        }
                    }

                    //usermanual
                if (similar.usermanual !== undefined) {
                    for (var l = 0; l < similar.usermanual.length; l++) {
                        if (similar.usermanual[l].data !== undefined)
                                similar.usermanual[l].data = similar.usermanual[l].data.slice(6);
                        }
                    }

                similar.price = Math.round((parseFloat(similar.price) * parseFloat(similar.profit) * parseInt(EuroVal)) / 1000) * 1000;
                similar.afterdiscount = Math.round((parseFloat(similar.afterdiscount) * parseFloat(similar.profit) * parseInt(EuroVal)) / 1000) * 1000;
                    
                if (similar.attributes !== undefined) {

                        let attrs = [];
                    for (var k = 0; k < similar.attributes.length; k++) {
        
                        if (similar.attributes[k].force === true) {
        
                            similar.attributes[k].values.map(async (pr_attr) => {
                                
                                if (pr_attr.isDefault === true) {
        
                                        attrs.push({
                                            value: pr_attr.name
                                        });
        
                                    }
        
                                });
                            }
        
                        }
        
                    if (attrs.length > 0) {
        
                            let product = await chargersLookup
                            .findOne({
                                product_id: similar._id
                            })
                            .exec();
        
                            let inputAttrs = [];
        
                            await Promise.all(attrs.map(attr => {
                                inputAttrs.push(attr.value);
                            }));
        
                        if (product) {
        
                                let price = 0;
                                let exists = false;
        
                                await Promise.all(product.models.map(mdl => {
                                if (arraysEqual(inputAttrs, mdl.attrs) === true) {
                                        price = mdl.price;
                                        exists = true;
                                    }
                                }));
        
                            if (exists === true) {
        
                                if (similar.profit === 0) {
                                        similar.profit = 1;
                                    }
                                        
                                similar.price = Math.round((parseFloat(price) * parseFloat(similar.profit) * parseInt(EuroVal)) / 1000) * 1000;
                                    similar.afterdiscount = parseInt(similar.price) - (parseInt(similar.price) * (similar.discount / 100));
        
                                }
        
                            }
                        }
                    }
                    // if(similar.attributes){
                    //     for(var k=0; k < similar.attributes.length; k++) {

                    //         similar.attributes[k].values.map(pr_attr => {
                    //             pr_attr.price = Math.round((parseFloat(pr_attr.price) * parseFloat(similar.profit) * parseInt(EuroVal))/1000)*1000;
                    //         });
                    //     }
                    // }
                })
            )

        }
        
    res.status(200).json({ charger, similars })
    /*})
    .catch(err =>
        res.status(404).json({
          loaderror: 'عملیات ناموفق'
        })
    );*/
});
router.post('/addDescription', async (req, res) => {

    if (req.body.chargerId === undefined) {
        return res.status(400).json('خطا در پارامتر ورودی شناسه کالا')
    } else if (req.body.description === undefined || req.body.description === '') {
        return res.status(400).json('خطا در پارامتر ورودی نقد و بررسی');
    } else {
        const product = await chargerProductModel
        .findOneAndUpdate(
            {
                _id: req.body.chargerId
            },
            {
                description: req.body.description
            },
            {
                new: true
            }
        )
        .exec();

        if (product) {
            return res.status(200).send(product);
        } else {
            return res.status(400).json('خطا در عملیات بروزرسانی نقد و بررسی');
        }
    }
});

const chargersLookup = require('../../../models/store/cahrgersLookup');
const bodyParser = require('body-parser');

const arraysEqual = (a1, a2) => {
    if (a1.length === a2.length) {
        let final_result = true;
        a1.forEach((o, idx) => {
            {
                let result = false;
                let idx2 = 0;
                do {
                    result = false;
                    if (idx2 < a2.length) {
                        o = o.replace(/\s+/g, '');
                        a2[idx2] = a2[idx2].replace(/\s+/g, '');

                        result = o.toLowerCase() == a2[idx2].toLowerCase() ? true : false;
                    }
                    else {
                        break;
                    }
                    idx2 += 1;
                } while (!result)
        
                if (!result && idx2 >= a2.length) {
                    final_result = false;
                    return;
                }
                
            };
        })

        return final_result;
        
    } else {
        return false;
    }
}

router.get('/insertAttributeHTML', function (req, res) {
    res.sendFile(__dirname + '/insertAttributeStore.html');

});

let addNewAttribute = async function (product_id, attrs, name, sapcode, price) {

    return new Promise(async (resolve, reject) => {

        let attribute = await chargersLookup
        .findOne({
            product_id: product_id
        })
        .exec();

        let inputAttrs = [];
        await Promise.all(attrs.map(attr => {
            inputAttrs.push(attr.value);
        }));
    
        //const inputAttrs = attrs.split(/[,،]/);
    
        if (attribute) {
    
            let modelExists = false;
            await Promise.all(attribute.models.map(mdl => {
                if (arraysEqual(inputAttrs, mdl.attrs) === true) {
                    modelExists = true;
                }
            }));
    
            if (modelExists === false) {
                
                attribute.models.push({
                    name: name, 
                    sapcode: sapcode,
                    attrs: inputAttrs,
                    price: price
                });
                await attribute.save();
    
            }
    
            return resolve(attribute);
    
        } else {
    
            let charger = await chargerProductModel
            .findOne({
                _id: product_id
            })
            .lean()
            .exec();
    
            if (charger) {
                let new_attribute = new chargersLookup({
                    name: charger.product_model,
                    product_id: product_id,
                    models: [{
                        name: name, 
                        sapcode: sapcode,
                        attrs: inputAttrs,
                        price: price
                    }]
                });
    
                await new_attribute.save();
    
                return resolve(new_attribute);
    
            } else {
                return reject('محصولی با این مشخصات یافت نشد');
            }
        }
    })
    
}

router.post('/addAttribute', async (req, res) => {

    if (req.body.all_attrs && req.body.product_id) {

        let updated = [];
        await Promise.all(req.body.all_attrs.map(async (attr) => {

            attr.name = "test";
            if (attr.attrs && attr.name && attr.sapcode && attr.price) {

                let attribute = await addNewAttribute(req.body.product_id, attr.attrs, attr.name, attr.sapcode, attr.price)
                updated.push(attribute);

            } else {
                return res.status(400).json('خطا در پارامترهای ورودی');
            }

        }));

        let charger = await chargerProductModel
            .findOne({
                _id: req.body.product_id
            })
            .lean()
            .exec();

        return res.status(200).json(charger);

    } else {
        return res.status(400).json('خطا در پارامترهای ورودی');
    }
    
});

router.post('/retrievePrice', async (req, res) => {

    let product = await chargersLookup
    .findOne({
        product_id: req.body.product_id
    })
    .exec();

    let inputAttrs = [];

    await Promise.all(req.body.attrs.map(attr => {
        inputAttrs.push(attr.value);
    }));

    //const inputAttrs = req.body.attrs.split(/[,،]/);
    console.log(req.body.product_id, inputAttrs)
    if (product) {

        let price = 0;
        let exists = false;

        await Promise.all(product.models.map(mdl => {
            if (arraysEqual(inputAttrs, mdl.attrs) === true) {
                price = mdl.price;
                exists = true;
            }
        }));

        if (exists === true) {

            const charger = await chargerProductModel
            .findOne({
                _id: req.body.product_id
            })
            .lean()
            .exec();

            if (charger) {
                let uero = await lastEuro
                .find()
                .exec();

                let EuroVal = uero[0].lastValue;
                if (keys.EuroVal && parseInt(keys.EuroVal) > 0) {
                    EuroVal = keys.EuroVal;
                }

                if (charger.profit === 0) {
                    charger.profit = 1;
                }
                
                price = Math.round((parseFloat(price) * parseFloat(charger.profit) * parseInt(EuroVal)) / 1000) * 1000;
                const afterdiscount = parseInt(price) - (parseInt(price) * (charger.discount / 100));

                return res.status(200).json({ price, afterdiscount });

            } else {

                return res.status(400).json('محصولی با این مشخصات یافت نشد');
            }

        } else {
            return res.status(400).json('محصولی با این مشخصات یافت نشد');
        }

    } else {

        return res.status(400).json('محصولی با این مشخصات یافت نشد');
        
    }
});

module.exports = router;