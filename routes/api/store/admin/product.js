let isEmpty = require('../../../../validation/is-empty');
const userAdminModel = require('../../../../models/userAdmin');
const RefTok = require('../../../../models/RefTokcms');

const productModel = require('../../../../models/store/Chargers');
const multer = require('multer'); 

const express = require('express');
const jwt = require("jsonwebtoken");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const randtoken = require('rand-token');
const keys = require("../../../../config/keys");
const { session } = require('passport');
const mongoose = require('mongoose');
const category = require('../../../../models/store/Categories');
const  editLogModel = require('../../../../models/store/ChargersEditLog');
const attributeField = require('../../../../models/store/attributeFields');
const lastEuro = require('../../../../models/store/EuroChanged');
const lookup = require('../../../../models/store/cahrgersLookup')

const router = express.Router();

multer({
    dest: keys.appDir + '/public/images/'
});
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, keys.appDir + '/public/images/')
    },
    filename: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == 'application/pdf') {
            cb(null, file.originalname);
        } else {
            req.fileValidationError = 'فرمت فایل صحیح نمی‌باشد';
            cb(null, file.originalname);
        }
        
    }
});

let upload = multer({storage: storage});

router.post("/deactive", passport.authenticate('jwt', {
session: false}), (req, res) => {


});

let getChargers = function(){

    return new Promise(async (resolve, reject) => {

        let uero = await lastEuro
            .find()
            .exec();

        let EuroVal = uero[0].lastValue;
        if(keys.EuroVal && parseInt(keys.EuroVal) > 0)
        {
            EuroVal = keys.EuroVal;
        }
        let resp = await productModel.find(
            // {
            //     active: true
            // }
        )
        .sort({order:1})
        .lean()
        .exec();

        //.then(async (resp) => {
        if(resp){
            let Chargers=[];
            let parent_Models=[];
            let parent_Chargers=[];
            await Promise.all(resp.map(async (resp1) => {

                if(parseInt(resp1.parentId)!=0){
                    if(resp1.product_model==undefined || resp1.product_model=="" || resp1.product_model==''){
                        await productModel.findOne({
                            "_id": resp1.parentId
                        })
                        .then(async (parent) => {
                            if(parent){
                                //console.log("ok")
                                resp1.parent_name=parent.name;
                                resp1.parent_ENname=parent.ENname;
                                resp1.productID = resp1._id;
                                parent_Models.push(resp1)
                            }
                        })
                        .catch(err => {
                            return reject(err);
                        });
                    }
                    else {
                        resp1.parent_name=resp1.name;
                        resp1.parent_ENname=resp1.ENname;
                        resp1.productID = resp1._id;
                        Chargers.push(resp1)
                    }
                }
                else
                    parent_Chargers.push(resp1)
            }));
            let array=[];
            let childs=[];
            let childs_Model=[];
            let charger_obj={};
            let charger_model_obj={};
            for(var j=0; j <parent_Chargers.length; j++) {
                charger_obj={};
                childs=[];
                charger_obj.parent_name=parent_Chargers[j].name;
                charger_obj.parent_ENname=parent_Chargers[j].ENname;
                charger_obj.active=parent_Chargers[j].active;
                if(parent_Chargers[j].hide !== undefined && parent_Chargers[j].hide === true){
                    charger_obj.hide = true;
                }else{
                    charger_obj.hide = false;
                }
                charger_obj.parent_id=parent_Chargers[j]._id;
            
                let new_files = [];
                if(parent_Chargers[j].image){
                    for(var k=0; k<parent_Chargers[j].image.length; k++) {
                    // parent_Chargers[j].image[k].files.forEach(file => {
                            let new_file = {};//Object.assign({}, file);
                            
                            if(parent_Chargers[j].image[k].data !== undefined){
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
                charger_obj.images=new_files;
                for(var i=0; i<parent_Models.length; i++) {
                    if(parent_Chargers[j]._id==parent_Models[i].parentId) {
                    
                        childs_Model=[];
                        let new_files_child = [];

                        //let new_files = [];

                        if(parent_Models[i].price && parent_Models[i].profit){
                            parent_Models[i].price = Math.round((parseFloat(parent_Models[i].price) * parseFloat(parent_Models[i].profit) * parseInt(EuroVal))/1000)*1000;
                        }

                        if(parent_Models[i].afterdiscount && parent_Models[i].profit){
                        parent_Models[i].afterdiscount = Math.round((parseFloat(parent_Models[i].afterdiscount) * parseFloat(parent_Models[i].profit) * parseInt(EuroVal))/1000)*1000;
                        }
                        
                        if(parent_Models[i].price === null){
                            parent_Models[i].price = 0;
                        }

                        if(parent_Models[i].afterdiscount === null){
                            parent_Models[i].afterdiscount = 0;
                        }

                        if(parent_Models[i].attributes !== undefined){
                            for(var k=0; k < parent_Models[i].attributes.length; k++) {

                                parent_Models[i].attributes[k].values.map(pr_attr => {
                                    pr_attr.price = Math.round((parseFloat(pr_attr.price) * parseFloat(parent_Models[i].profit) * parseInt(EuroVal))/1000)*1000;
                                    if(pr_attr.price === null || pr_attr.price === ''){
                                        pr_attr.price = 0;
                                    }
                                });
                            }
                        }
                        
                        if(parent_Models[i].image){
                            for(var q=0; q<parent_Models[i].image.length; q++) {
                                //Chargers[i].image[q].files.forEach(file_ => {
                                    let new_files = {};//Object.assign({}, file);
                                    
                                    if(parent_Models[i].image[q].data !== undefined){
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
                        for(var t=0; t<Chargers.length; t++) {
                            if(parent_Models[i]._id==Chargers[t].parentId) {
                                let new_files_child = [];
                                Chargers[t].price = Math.round((parseFloat(Chargers[t].price) * parseFloat(Chargers[t].profit) * parseInt(EuroVal))/1000)*1000;
                                Chargers[t].afterdiscount = Math.round((parseFloat(Chargers[t].afterdiscount) * parseFloat(Chargers[t].profit) * parseInt(EuroVal))/1000)*1000;
                                
                                if(Chargers[t].price === null || Chargers[t].price === '' || Chargers[t].price === undefined){
                                    Chargers[t].price = 0;
                                }
                                if(Chargers[t].afterdiscount === null || Chargers[t].afterdiscount === '' || Chargers[t].afterdiscount === undefined){
                                    Chargers[t].afterdiscount = 0;
                                }

                                if(Chargers[t].attributes){
                                    for(var k=0; k < Chargers[t].attributes.length; k++) {
            
                                        Chargers[t].attributes[k].values.map(pr_attr => {
                                            pr_attr.price = Math.round((parseFloat(pr_attr.price) * parseFloat(Chargers[t].profit) * parseInt(EuroVal))/1000)*1000;
                                            if(pr_attr.price === null || pr_attr.price === '' || pr_attr.price === undefined){
                                                pr_attr.price = 0;
                                            }
                                        });
                                    }
                                }
                                

                                if(Chargers[t].image){
                                    for(var l=0; l<Chargers[t].image.length; l++) {
                                        //Chargers[i].image[q].files.forEach(file_ => {
                                            let new_file_child = {};//Object.assign({}, file);
                                            
                                            if(Chargers[t].image[l].data !== undefined){
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
                                if(Chargers[t].catalog !== undefined){
                                    for(var l=0; l<Chargers[t].catalog.length; l++){
                                        if(Chargers[t].catalog[l].data !== undefined)
                                            Chargers[t].catalog[l].data = Chargers[t].catalog[l].data.slice(6);
                                    }
                                }

                                //ENcatalog
                                if(Chargers[t].ENcatalog !== undefined){
                                    for(var l=0; l<Chargers[t].ENcatalog.length; l++){
                                        if(Chargers[t].ENcatalog[l].data !== undefined)
                                            Chargers[t].ENcatalog[l].data = Chargers[t].ENcatalog[l].data.slice(6);
                                    }
                                }

                                //usermanual
                                if(Chargers[t].usermanual !== undefined){
                                    for(var l=0; l<Chargers[t].usermanual.length; l++){
                                        if(Chargers[t].usermanual[l].data)
                                            Chargers[t].usermanual[l].data = Chargers[t].usermanual[l].data.slice(6);
                                    }
                                }

                                Chargers[t].images=new_files_child;

                                if(Chargers[t].price === null){
                                    Chargers[t].price = 0;
                                }
                                //console.log(Chargers[t].afterdiscount)
                                if(Chargers[t].afterdiscount === null || Chargers[t].afterdiscount === undefined){
                                    Chargers[t].afterdiscount = 0;
                                }

                                if(Chargers[t].discount === null){
                                    Chargers[t].discount = 0;
                                }

                                if(Chargers[t].deliveryPrice === null){
                                    Chargers[t].deliveryPrice = 0;
                                }

                                if(Chargers[t].InstallationPrice === null){
                                    Chargers[t].InstallationPrice = 0;
                                }

                                childs_Model.push(Chargers[t]);
                            }
                        }
                        parent_Models[i].childs=childs_Model;
                        childs.push(parent_Models[i]);
                    }
                    //childs_Model.push(parent_Models[i]);
                }
                childs.sort((item1,item2) => item1.order < item2.order ? -1 : 1)
                charger_obj.childs=childs;
                array.push(charger_obj);
            }
                
            return resolve(array)
        }
    })
}

/**
 * ایجاد کالای سطح 1 و2
 * درصورتیکه کالا سطح 2 باشد، حتما باید زیرمجموعه یک کالای سطح 1 باشد
 */
router.post("/insertParent", /*passport.authenticate('jwt', {
    session: false}),*/ upload.single('image'), async (req, res) => {

        if(req.body.productLevel != undefined && 
            [1, 2].includes(parseInt(req.body.productLevel)) && 
            !(parseInt(req.body.productLevel) === 2 && (!req.body.parentId || !mongoose.Types.ObjectId.isValid(req.body.parentId))))
        {
            if(req.fileValidationError && req.fileValidationError.length > 0){
                return res.status(400).json({error: 'فرمت فایل صحیح نمی‌باشد', errorEN:"Invalid file format"});
            }else{
                //if(req.file){
                    if (req.file && req.file.size > 5000000)
                        return res.status(400).json({error: 'حجم فایل نباید بیشتر از 5 مگابایت باشد', 
                                                    errorEN: 'File size should not exceed 5M'});
                    else{

                        let dataPath = '';
                        if(req.file)
                        {
                            var splitted = req.file.path.split(keys.lastDir);
                            if(splitted[1])
                                dataPath = splitted[1];
                            else{
                                dataPath = req.file.path;
                            }
                        }

                        if(req.body.parentId && 
                            parseInt(req.body.parentId) !== 0 && 
                            mongoose.Types.ObjectId.isValid(req.body.parentId)){

                            const parent = await productModel
                            .findOne({
                                _id: req.body.parentId
                            })
                            .exec();

                            if(!parent){
                                return res.status(400).json({message: 'پرنت سطح اول یافت نشد',
                                                            messageEN: 'The parent in level 1 not found'});
                            }
                        }else{
                            req.body.parentId = 0;
                        }

                        if(typeof(req.body.active) !=='boolean'){
                            req.body.active = false;
                        }

                        if(!req.body.name || !req.body.ENname){
                            return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
                        }else{

                            let img = '';
                            if(dataPath.length > 0)
                            {
                                img = {
                                    data: dataPath,
                                    contentType: req.file.mimetype
                                }
                            }
                            let parent = new productModel({
                                active: req.body.active,
                                parentId: req.body.parentId,
                                name: req.body.name,
                                image: img !== '' ? [img] : [],
                                ENname: req.body.ENname,
                                product_model:""
                            });
                    
                            await parent.save();
                    
                            let chargers = await getChargers();
                            return res.status(200).json(chargers);
                        }
                    }
                // }else{
                //     return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
                // }
            }
        }else{
            return res.status(400).json({message: 'سطح کالا نامعتبر است', messageEN: 'The level of product is invalid'});
        }
        
});

let propertiesValidation = async function(properties){

    return new Promise(async (resolve, reject) => {

        if(properties){
            await Promise.all(properties.map(async (property) => {
    
                let category_ = '';
                if(mongoose.Types.ObjectId.isValid(property.categoryId)){
        
                    category_ = await category
                    .findOne({
                        _id: property.categoryId
                    })
                    .exec();
                }
        
                if(!property.name || !property.title || !property.value || !property.ENvalue || !property.ENtitle || category_ === ''){
                    resolve(false);
                }
            }));

            resolve(true);
        }else{
            resolve(false);
        }
    });
}

let attributesValidation = async function(attributes){

    return new Promise(async(resolve, reject) => {
        if(attributes)
        {
            await Promise.all(attributes.map(async (attr) => {
    
                if(typeof(attr.force) !=='boolean'){
                    attr.force = false;
                }
    
                if(typeof(attr.valid) !=='boolean'){
                    attr.valid = false;
                }
                
                if(!attr.name || !attr.title){
                    resolve(false);
                }else{
    
                    if(attr.values.length <= 0){
                        resolve(false);
                    }
    
                    await Promise.all(attr.values.map(val => {
    
                        if(typeof(val.isDefault) !== 'boolean'){
                            val.isDefault = false;
                        }
    
                        if(!val.name || !val.title){
                            resolve(false);
                        }
                    }));
                }
            }));

            resolve(true);
        }else{
            resolve(false);
        }
    });
    
}

let featuresValidation = async function(features){

    return new Promise(async(resolve, reject) => {

        if(features)
        {
            await Promise.all(features.map(feature => {
                console.log("feature", feature);
                console.log("\n");
                if(!feature.value || !feature.ENvalue){
                    resolve(false);
                }
            }));

            resolve(true);

        }else{
            resolve(false);
        }
    });

    
}

let installationareaValidation = async function(installationarea){

    return new Promise(async(resolve, reject) => {

        if(installationarea)
        {
            await Promise.all(installationarea.map(area => {
                console.log("area", area);
                console.log("\n");
                if(!area.name || !area.title || !area.ENtitle){
                    resolve(false);
                }
            }));

            resolve(true);
        }else{
            resolve(false);
        }

    });
    
}

let faqsValidation = async function(faqs){

    return new Promise(async (resolve, reject) => {

        if(faqs)
        {
            await Promise.all(faqs.map(faq => {
                console.log("faq", faq);
                console.log('\n');
                if(!faq.question || !faq.answer){
                    resolve(false);
                }
            }));

            resolve(true);
        }else{
            resolve(false);
        }
    });

    
}

//اضافه کردن محصول سطح آخر کلا چند مرحله دارد، که مرحله اول آن اضافه کردن اطلاعات اولیه محصول است
router.post('/insertProduct/basics', upload.fields([{name:'image', maxCount: 1}]), async(req, res) => {

    try{
        if(req.body.parentId && 
            parseInt(req.body.parentId) !== 0 && 
            mongoose.Types.ObjectId.isValid(req.body.parentId)){
    
            const parent = await productModel
            .findOne({
                _id: req.body.parentId
            })
            .exec();
    
            if(!parent){
                return res.status(400).json({message: 'پرنت کالا نامعتبر است',
                                            messageEN: 'The parent is invalid'});
            }else{
                req.body.name = parent.name;
                req.body.ENname = parent.ENname;
            }
    
        }else{
            return res.status(400).json({message: 'پرنت کالا نامعتبر است',
                                        messageEN: 'The parent is invalid'});
        }
    
        // if(req.body.active && req.body.active === "true"){
        //     req.body.active = true;
        // }else{
        //     req.body.active = false;
    
        // }
    
        // if(req.body.activeproduct && req.body.activeproduct === "true"){
        //     req.body.activeproduct = true;
        // }else{
        //     req.body.activeproduct = false;
    
        // }
    
        // if(req.body.UploadDoc || req.body.UploadDoc === "true"){
        //     req.body.UploadDoc = true;
        // }else{
        //     req.body.UploadDoc = false;
    
        // }
    
        if(!req.body.name || !req.body.ENname ||
            !req.body.product_model || !req.body.price ||
            !req.body.installationarea){
    
            return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
            //req.body.active = false;
        }//else{
    
            const afterdiscount = parseInt(req.body.price) - (parseInt(req.body.price) * (req.body.discount / 100));
    
            if(!req.body.InstallationPrice){
                req.body.InstallationPrice = 0;
            }
    
            if(!req.body.deliveryPrice){
                req.body.deliveryPrice = 0;
            }
    
            if(!req.body.profit || (req.body.profit && parseInt(req.body.profit) <= 0)){
                req.body.profit = 1;
            }
    
            let dataPathImg = '';
            let img = '';
            if(req.files && req.files['image']){
                
                var splitted = req.files['image'][0].path.split(keys.lastDir);
                if(splitted[1]){
                    dataPathImg = splitted[1];
                } else{
                    dataPathImg = req.files['image'][0].path;
                }
        
                img = {
                    data: dataPathImg,
                    contentType: req.files['image'][0].mimetype
                }
            }
            
    
            // let dataPathModel = '';
            // var splitted = req.files['productModel'][0].path.split(keys.lastDir);
            // if(splitted[1]){
            //     dataPathModel = splitted[1];
            // } else{
            //     dataPathModel = req.files['productModel'][0].path;
            // }
    
            // let model = {
            //     data: dataPathModel,
            //     contentType: req.files['productModel'][0].mimetype
            // }
    
            // if(typeof(req.body.installationarea) === 'string'){
            //     req.body.installationarea = req.body.installationarea.split(/,|،/);
            // }
    
            let areas = JSON.parse(req.body.installationarea);
            console.log(areas);
            let areaValidation = await installationareaValidation(areas/*req.body.installationarea*/);
            console.log("areaValidation", areaValidation);
            if(areaValidation !== true){
                return res.status(400).json({message: '(مراکز قابل نصب)خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
            //req.body.active = false;
    
            }

            let features_ = [];
    
            if(req.body.features){

                features_ = JSON.parse(req.body.features);
                console.log(features_);
                let featureValidation = await featuresValidation(features_);
                console.log("featureValidation", featureValidation);

                if(featureValidation !== true){
                    return res.status(400).json('(ویژگی ها)خطا در پارامترهای ورودی');
                }
        
            }
    
            let lastOrder = await productModel
            .find()
            .sort('-order')
            .exec();
    
            let order = 0;
    
            if(lastOrder && lastOrder[0] && lastOrder[0].order)
            {
                order = parseInt(lastOrder[0].order) + 1;
            }
            
            let areaArray = JSON.parse(req.body.installationarea);
            console.log("areaArray", areaArray);
    
            if(req.body.active === 'true'){
                req.body.active = true;
            }else if(req.body.active === 'false'){
                req.body.active = false;
            }

            if(req.body.activeproduct === 'true'){
                req.body.activeproduct = true;
            }else if(req.body.activeproduct === 'false'){
                req.body.activeproduct = false;
            }

            if(req.body.UploadDoc === 'true'){
                req.body.UploadDoc = true;
            }else if(req.body.UploadDoc === 'false'){
                req.body.UploadDoc = false;
            }

            let parent = new productModel({
                active: req.body.active,
                activeproduct: req.body.activeproduct,
                parentId: req.body.parentId,
                name: req.body.name,
                image: [img],
                //model: [model],
                ENname: req.body.ENname,
                product_model: req.body.product_model,
                price: req.body.price,
                discount: req.body.discount,
                afterdiscount: afterdiscount,
                profit: req.body.profit,
                UploadDoc: req.body.UploadDoc,
                installationarea: areas,
                InstallationPrice: req.body.InstallationPrice,
                deliveryPrice: req.body.deliveryPrice,
                features: features_,
                status: 1,
                order: order
            });
        
            await parent.save();
        
            return res.status(200).json(parent);
        
        //}
    }catch(e){
        console.log(e);
    }
    
    
});

router.post('/insertProduct/descriptions', async(req, res) => {

    if(req.body.productId){

        let product = await productModel
        .findOne({
            _id: req.body.productId
        })
        .exec();

        if(product){

            if(!req.body.description ||
                !req.body.shortdescription ||
                !req.body.descriptionproduct || !req.body.ENdescription ||
                !req.body.ENdescriptionproduct || !req.body.ENshortdescription){
        
                    product.active = false;
            }//else{
        
                if(req.body.shortdescription){
                    product.shortdescription = JSON.parse(req.body.shortdescription);
                }
        
                if(req.body.ENshortdescription){
                    product.ENshortdescription = JSON.parse(req.body.ENshortdescription);
                }
        
                let faqVal = await faqsValidation(req.body.FAQ);
                if(faqVal !== true){
                    product.active = false;
        
                }

                product.description = req.body.description;
                product.ENdescription = req.body.ENdescription;
                product.descriptionproduct = req.body.descriptionproduct;
                product.ENdescriptionproduct = req.body.ENdescriptionproduct;;
                product.FAQ = req.body.FAQ;
                product.ENfaq = req.body.ENfaq;
                product.status = 2;
            
                await product.save();
            
                return res.status(200).json(product);
            
            //}

        }else{
            return res.status(400).json('خطا در پارامترهای ورودی');
        }
        
    }else{
        return res.status(400).json('خطا در پارامترهای ورودی');
    }

});

router.post('/attributes/prepare', async(req, res) => {

    if(req.body.attributes){

        const numAttributes = req.body.attributes.length;
        let toShow = [];
        let equals = [];

        await Promise.all(req.body.attributes.map(async (attribute) => {
            let valsTitles = [];

            await Promise.all(attribute.values.map(async(val) => {

                if(val.equal_id){

                    let equal = equals.includes(val.name);
                    if(!equal)
                    {
                        valsTitles.push(val.title);
                        equals.push(val.name);
                    }

                }else{
                    valsTitles.push(val.title);
                    
                }
                
            }));

            toShow.push({
                name: attribute.title,
                values: valsTitles
            });
            //toShow[attribute.title] = valsTitles;

        }));

        return res.status(200).json({toShow, numAttributes});

    }else{
        return res.status(400).json('خطا در پارامترهای ورودی');
    }
});

router.post('/insertProduct/attributes', async(req, res) => {
    //console.log(req.body, req.body.attributes, req.body.productId);

    if(req.body.attributes && req.body.productId){

        let attrValidation = await attributesValidation(req.body.attributes);
        if(attrValidation !== false){

            const numAttributes = req.body.attributes.length;
            let toShow = [];
            let equals = [];

            await Promise.all(req.body.attributes.map(async (attribute) => {
                let valsTitles = [];

                await Promise.all(attribute.values.map(async(val) => {

                    if(val.equal_id){

                        let equal = equals.includes(val.name);
                        if(!equal)
                        {
                            valsTitles.push(val.title);
                            equals.push(val.name);
                        }

                    }else{
                        valsTitles.push(val.title);
                        
                    }
                    
                }));

                toShow.push({
                    name: attribute.title,
                    values: valsTitles
                });
                //toShow[attribute.title] = valsTitles;

            }));

            const updatedAttributes = await productModel
            .findOneAndUpdate({
                _id: req.body.productId
            },{
                attributes: req.body.attributes,
                status: 3
            },{
                new: true
            })
            .exec();

            return res.status(200).json({toShow, numAttributes, updatedAttributes});

        }else{
            return res.status(400).json('خطا در پارامترهای ورودی');
        }

    }else{
        return res.status(400).json('خطا در پارامترهای ورودی');
    }
        
});

router.post('/insertProduct/properties', async(req, res) => {

    if(req.body.properties && req.body.productId){

        let properties = [];
        await Promise.all(req.body.properties.map(prop => {

            if(prop.list){
                properties = properties.concat(prop.list);
            }
        }));

        let propValidation = await propertiesValidation(properties);
        if(propValidation !== false){

             const charger = await productModel
             .findOneAndUpdate({
                 _id: req.body.productId
             },{
                properties: properties,
                status: 4
             },{
                 new: true
             })
             .exec();

             return res.status(200).json(charger);

        }else{
            return res.status(400).json('خطا در پارامترهای ورودی');
        }

    }else{
        return res.status(400).json('خطا در پارامترهای ورودی');
    }
        
});

router.post('/insertProduct/files', upload.fields([{name:'catalog', maxCount: 1}, 
                                            {name:'ENcatalog', maxCount: 1}, 
                                            {name:'usermanual', maxCount: 1},
                                            {name:'ENusermanual', maxCount: 1}]), async(req, res) => {

        if(req.body.productId){
            
            let dataPathCatalog = '';
            var splitted = req.files['catalog'][0].path.split(keys.lastDir);
            if(splitted[1]){
                dataPathCatalog = splitted[1];
            } else{
                dataPathCatalog = req.files['catalog'][0].path;
            }
            let catalog = {
                data: dataPathCatalog,
                contentType: req.files['catalog'][0].mimetype
            }
    
            let dataPathENatalog = '';
            var splitted = req.files['ENcatalog'][0].path.split(keys.lastDir);
            if(splitted[1]){
                dataPathENatalog = splitted[1];
            } else{
                dataPathENatalog = req.files['ENcatalog'][0].path;
            }
            let ENcatalog = {
                data: dataPathENatalog,
                contentType: req.files['ENcatalog'][0].mimetype
            }
    
            let dataPathUsermanual = '';
            var splitted = req.files['usermanual'][0].path.split(keys.lastDir);
            if(splitted[1]){
                dataPathUsermanual = splitted[1];
            } else{
                dataPathUsermanual = req.files['usermanual'][0].path;
            }
            let usermanual = {
                data: dataPathUsermanual,
                contentType: req.files['usermanual'][0].mimetype
            }

            let dataPathENUsermanual = '';
            var splitted = req.files['ENusermanual'][0].path.split(keys.lastDir);
            if(splitted[1]){
                dataPathENUsermanual = splitted[1];
            } else{
                dataPathENUsermanual = req.files['ENusermanual'][0].path;
            }
            let ENusermanual = {
                data: dataPathENUsermanual,
                contentType: req.files['ENusermanual'][0].mimetype
            }

            const charger = await productModel
            .findOneAndUpdate({
                _id: req.body.productId
            },{
                catalog: [catalog],
                ENcatalog: [ENcatalog],
                usermanual:  [usermanual],
                ENusermanual:  [ENusermanual],
                status: 5
            },{
                new: true
            })
            .exec();

            return res.status(200).json(charger);
    
        }else{
            return res.status(400).json('خطا در پارامترهای ورودی');
        }
    
});

router.post('/editParent', upload.single('image'), async(req, res)=>{

    if(req.body._id){

        let pro = await productModel
        .findOne(
            {
                _id: req.body._id
            }
        )
        .exec();

        if(pro){

            if(req.body.active !== undefined && req.body.active !== '' && typeof(req.body.active) === 'boolean' &&
                pro.active !== req.body.active){

                    const log = new editLogModel({
                        productId:req.body._id,
                        field: "active",
                        before: pro.active,
                        after: req.body.active
                    });
                pro.active = req.body.active;
                await log.save();
            }

            if(req.body.imgChanged && typeof(req.body.imgChanged) === 'boolean' && req.body.imgChanged === true && req.file && req.file.path){

                if (req.file.size > 5000000){
                    return res.status(400).json({error: 'حجم فایل نباید بیشتر از 5 مگابایت باشد', 
                                                    errorEN: 'File size should not exceed 5M'});
                }else{

                        let dataPath = '';
                        var splitted = req.file.path.split(keys.lastDir);
                        if(splitted[1])
                            dataPath = splitted[1];
                        else{
                            dataPath = req.file.path;
                        }
                }

                let newImg = {
                    data: dataPath,
                    contentType: req.file.mimetype
                }

                pro.image = [];
                pro.image = [newImg];

                const log = new editLogModel({
                    productId:req.body._id,
                    field: "image",
                    before: '-',
                    after: '-'
                });

                await log.save();

            }

            await pro.save();

            let chargers = await getChargers();
            return res.status(200).json(chargers);
            
        }else{

            return res.status(400).json({message: 'کالایی با این مشخصات یافت نشد', messageEN: 'The product not found'});
        }

    }else{
        return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
    }
    
});

router.post('/productEdit/basics', upload.fields([{name:'image', maxCount: 1}]), async (req, res) => {

    // "FAQ": 
    // "review": [],
   
    if(req.body.productId){

        let pro = await productModel
        .findOne({
            _id: req.body.productId 
        })
        .exec();

        if(pro){

            if(req.body.active !== undefined && req.body.active !== '' && typeof(req.body.active) === 'boolean' &&
                pro.active !== req.body.active){

                const log = new editLogModel({
                    productId:req.body.productId,
                    field: "active",
                    before: pro.active,
                    after: req.body.active
                });

                pro.active = req.body.active;
                await log.save();
                
            }

            if(req.body.activeproduct !== undefined && req.body.activeproduct !== '' && typeof(req.body.activeproduct) === 'boolean' &&
                pro.activeproduct !== req.body.activeproduct){

                const log = new editLogModel({
                    productId:req.body.productId,
                    field: "activeproduct",
                    before: pro.activeproduct,
                    after: req.body.activeproduct
                });

                pro.activeproduct = req.body.activeproduct;
                await log.save();
                
            }

            if(req.body.UploadDoc !== undefined && req.body.UploadDoc !== '' && 
                typeof(req.body.UploadDoc) === 'boolean' &&
                pro.UploadDoc !== req.body.UploadDoc){
                
                const log = new editLogModel({
                    productId:req.body.productId,
                    field: "UploadDoc",
                    before: pro.UploadDoc,
                    after: req.body.UploadDoc
                });

                pro.UploadDoc = req.body.UploadDoc;
                await log.save();
            }

            if(req.body.name && req.body.name !== '' && req.body.name.length > 0 &&
                pro.name !== req.body.name){

                const log = new editLogModel({
                    productId:req.body.productId,
                    field: "name",
                    before: pro.name,
                    after: req.body.name
                });

                pro.name = req.body.name;
                await log.save();
            }

            if(req.body.ENname && req.body.ENname !== '' && req.body.ENname.length > 0 &&
                pro.ENname !== req.body.ENname){

                const log = new editLogModel({
                    productId:req.body.productId,
                    field: "ENname",
                    before: pro.ENname,
                    after: req.body.ENname
                });

                pro.ENname = req.body.ENname;
                await log.save();
            }

            if(req.body.product_model && req.body.product_model !== '' && req.body.product_model.length > 0 &&
                pro.product_model !== req.body.product_model){
                
                    const log = new editLogModel({
                        productId:req.body.productId,
                        field: "product_model",
                        before: pro.product_model,
                        after: req.body.product_model
                    });
    
                    pro.product_model = req.body.product_model;
                    await log.save();
            }

            if(req.body.price && req.body.price !== undefined && parseInt(req.body.price) > 0 &&
                pro.price !== req.body.price){
                
                    const log = new editLogModel({
                        productId:req.body.productId,
                        field: "price",
                        before: pro.price,
                        after: req.body.price
                    });
    
                    pro.price = req.body.price;
                    await log.save();
            }

            if(req.body.discount && req.body.discount !== '' && req.body.discount !== pro.discount &&
                pro.discount !== req.body.discount){

                                
                    const log = new editLogModel({
                        productId:req.body.productId,
                        field: "discount",
                        before: pro.discount,
                        after: req.body.discount
                    });
    
                pro.discount = req.body.discount;
                
                await log.save();
            }

            const afterdiscount = parseInt(pro.price) - (parseInt(pro.price) * (pro.discount / 100));
            pro.afterdiscount = afterdiscount;
            
            if(req.body.profit && req.body.profit !== '' && parseInt(req.body.profit) > 0 &&
                parseInt(pro.profit) !== parseInt(req.body.profit)){

                const log = new editLogModel({
                    productId:req.body.productId,
                    field: "profit",
                    before: pro.profit,
                    after: req.body.profit
                });
    
                pro.profit = req.body.profit;
                await log.save();
            }

            if(req.body.InstallationPrice && req.body.InstallationPrice !== '' && 
                parseInt(req.body.InstallationPrice) >= 0 &&
                parseInt(pro.InstallationPrice) !== parseInt(req.body.InstallationPrice)){
                
                const log = new editLogModel({
                    productId:req.body.productId,
                    field: "InstallationPrice",
                    before: pro.InstallationPrice,
                    after: req.body.InstallationPrice
                });
    
                pro.InstallationPrice = req.body.InstallationPrice;
                await log.save();
            }

            if(req.body.deliveryPrice && req.body.deliveryPrice !== '' && parseInt(req.body.deliveryPrice) >= 0 &&
                parseInt(pro.deliveryPrice) !== parseInt(req.body.deliveryPrice)){
                
                const log = new editLogModel({
                    productId:req.body.productId,
                    field: "deliveryPrice",
                    before: pro.deliveryPrice,
                    after: req.body.deliveryPrice
                });
    
                pro.deliveryPrice = req.body.deliveryPrice;
                await log.save();
            }

            let areas = [];

            // if(req.body.installationarea && 
            //     req.body.installationarea !== ''){

            //     areas = JSON.parse(req.body.installationarea);
            //     let areaValidation = await installationareaValidation(areas);

            //     if(areaValidation !== false){
            //         pro.installationarea = areas;
            //     }

            // }

            if(req.body.files){
                
                if(req.body.EditProductImg !== undefined && typeof(req.body.EditProductImg) === 'boolean' && req.body.EditProductImg === true && req.body.files['image']){

                    let dataPathImg = '';
                    var splitted = req.files['image'][0].path.split(keys.lastDir);
                    if(splitted[1]){
                        dataPathImg = splitted[1];
                    } else{
                        dataPathImg = req.files['image'].path;
                    }

                    let img = {
                        data: dataPathImg,
                        contentType: req.files['image'].mimetype
                    }

                    pro.img = [];
                    pro.img = [img];

                    const log = new editLogModel({
                        field: "img",
                        before: '-',
                        after: '-'
                    });

                    log.save();
                }
            }

            await pro.save();
            return res.status(200).json(pro);

        }else{
            return res.status(400).json({message: 'محصولی با این مشخصات یافت نشد', messageEN: 'Product not found'});
        }
        
    }else{
        return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
    }

});

router.post('/productEdit/descriptions', async (req, res) => {

    // "FAQ": 
    // "review": [],
   
    if(req.body.productId){

        let pro = await productModel
        .findOne({
            _id: req.body.productId 
        })
        .exec();

        if(pro){

            if(req.body.description && req.body.description !== '' && req.body.description.length > 0 && 
            req.body.description !== pro.description){
                
                const log = new editLogModel({
                    productId:req.body.productId,
                    field: "description",
                    before: pro.description,
                    after: req.body.description
                });
    
                pro.description = req.body.description;
                await log.save();
            }

            if(req.body.descriptionproduct && req.body.descriptionproduct !== '' && 
                req.body.descriptionproduct.length >0 && req.body.descriptionproduct !== pro.descriptionproduct){
                
                const log = new editLogModel({
                    productId:req.body.productId,
                    field: "descriptionproduct",
                    before: pro.descriptionproduct,
                    after: req.body.descriptionproduct
                });
    
                pro.descriptionproduct = req.body.descriptionproduct;
                await log.save();
            }

            if(req.body.ENdescription && req.body.ENdescription !== '' && req.body.ENdescription.length > 0 &&
            req.body.ENdescription !== pro.ENdescription){
               
                const log = new editLogModel({
                    productId:req.body.productId,
                    field: "ENdescription",
                    before: pro.ENdescription,
                    after: req.body.ENdescription
                });
    
                pro.ENdescription = req.body.ENdescription;
                await log.save(); 
            }

            if(req.body.ENdescriptionproduct && req.body.ENdescriptionproduct !== '' &&
             req.body.ENdescriptionproduct.length > 0 && req.body.ENdescriptionproduct !== pro.ENdescriptionproduct){
                
                const log = new editLogModel({
                    productId:req.body.productId,
                    field: "ENdescriptionproduct",
                    before: pro.ENdescriptionproduct,
                    after: req.body.ENdescriptionproduct
                });
    
                pro.ENdescriptionproduct = req.body.ENdescriptionproduct;
                await log.save();
            }

            // if(req.body.shortdescription && req.body.shortdescription !== '' && req.body.shortdescription.length > 0){
            //     pro.shortdescription = [];
            //     pro.shortdescription = req.body.shortdescription.split(/,|،/);
            // }

            // if(req.body.ENshortdescription && req.body.ENshortdescription !== '' && req.body.ENshortdescription.length > 0){
            //     pro.ENshortdescription = [];
            //     pro.ENshortdescription = req.body.ENshortdescription.split(/,|،/);
            // }

            // if(req.body.faqs && req.body.faqs !== '' &&
            //  req.body.faqs.length > 0 && req.body.faqs !== pro.faqs){
                
            //     const log = new editLogModel({
            //         productId:req.body.productId,
            //         field: "faqs",
            //         before: pro.faqs,
            //         after: req.body.faqs
            //     });
    
            //     pro.faqs = req.body.faqs;
            //     await log.save();
            // }

            // if(req.body.ENfaq && req.body.ENfaq !== '' &&
            //  req.body.ENfaq.length > 0 && req.body.ENfaq !== pro.ENfaq){
                
            //     const log = new editLogModel({
            //         productId:req.body.productId,
            //         field: "ENfaq",
            //         before: pro.ENfaq,
            //         after: req.body.ENfaq
            //     });
    
            //     pro.ENfaq = req.body.ENfaq;
            //     await log.save();
            // }

            await pro.save();
            return res.status(200).json(pro);

        }else{
            return res.status(400).json({message: 'محصولی با این مشخصات یافت نشد', messageEN: 'Product not found'});
        }
        
    }else{
        return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
    }

});

router.post('/productEdit/shortdescription', async (req, res) => {

    // "FAQ": 
    // "review": [],
   
    if(req.body.productId){

        let pro = await productModel
        .findOne({
            _id: req.body.productId 
        })
        .exec();

        if(pro){

            if(req.body.deleted_ids && req.body.deleted_ids.length > 0){

                await Promise.all(req.body.deleted_ids.map(async(index) => {

                    if(pro.shortdescription[index]){
                        pro.shortdescription.splice(index, 1);
                    }

                }));

                await pro.save();
            }

            if(req.body.edited && req.body.edited.length > 0){

                await Promise.all(req.body.edited.map(async (edited) => {

                    if(pro.shortdescription[edited.index]){
                        pro.shortdescription[edited.index] = edited.value;
                    }

                }));

                await productModel
                .findOneAndUpdate({
                    _id: req.body.productId
                },{
                    shortdescription: pro.shortdescription
                })
                .exec();

                //await pro.save();

            }

            if(req.body.inserted && req.body.inserted.length > 0){
                
                await Promise.all(req.body.inserted.map(async(newDec) => {

                        await productModel
                        .findOneAndUpdate({
                            _id: req.body.productId
                        },{
                            $push: {shortdescription: newDec}
                        })
                        .exec();
                }));
 
            }

            let proUpdated = await productModel
            .findOne({
                _id: req.body.productId 
            })
            .exec();
            
            return res.status(200).json(proUpdated);

        }else{
            return res.status(400).json({message: 'محصولی با این مشخصات یافت نشد', messageEN: 'Product not found'});
        }
        
    }else{
        return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
    }

});


router.post('/productEdit/ENshortdescription', async (req, res) => {

    // "FAQ": 
    // "review": [],
   
    if(req.body.productId){

        let pro = await productModel
        .findOne({
            _id: req.body.productId 
        })
        .exec();

        if(pro){

            if(req.body.deleted_ids && req.body.deleted_ids.length > 0){

                await Promise.all(req.body.deleted_ids.map(async(index) => {

                    if(pro.ENshortdescription[index]){
                        pro.ENshortdescription.splice(index, 1);
                    }

                }));

                await pro.save();
            }

            if(req.body.edited && req.body.edited.length > 0){

                await Promise.all(req.body.edited.map(async (edited) => {

                    if(pro.ENshortdescription[edited.index]){
                        pro.ENshortdescription[edited.index] = edited.value;
                    }

                }));

                await productModel
                .findOneAndUpdate({
                    _id: req.body.productId
                },{
                    ENshortdescription: pro.ENshortdescription
                })
                .exec();

            }

            if(req.body.inserted && req.body.inserted.length > 0){
                
                await Promise.all(req.body.inserted.map(async(newDec) => {

                        await productModel
                        .findOneAndUpdate({
                            _id: req.body.productId
                        },{
                            $push: {ENshortdescription: newDec}
                        })
                        .exec();
                }));
 
            }

            let proUpdated = await productModel
            .findOne({
                _id: req.body.productId 
            })
            .exec();
            
            return res.status(200).json(proUpdated);

        }else{
            return res.status(400).json({message: 'محصولی با این مشخصات یافت نشد', messageEN: 'Product not found'});
        }
        
    }else{
        return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
    }

});

router.post('/productEdit/features', async (req, res) => {

    // "FAQ": 
    // "review": [],
   
    if(req.body.productId){

        let pro = await productModel
        .findOne({
            _id: req.body.productId 
        })
        .exec();

        if(pro){

            if(req.body.deleted_ids && req.body.deleted_ids.length > 0){

                await Promise.all(req.body.deleted_ids.map(async(feature_id) => {
                    await productModel
                    .updateMany({
                        _id: req.body.productId
                    },{ 
                        "$pull": { 
                            "features": { "_id": feature_id } 
                        }
                    })
                    .exec();
                }));
            }

            if(req.body.edited && req.body.edited.length > 0){

                await Promise.all(req.body.edited.map(async (editedFeature) => {

                    await productModel
                    .findOneAndUpdate({
                        _id: req.body.productId,
                        features:{
                            $elemMatch:{_id: editedFeature._id}
                        }
                    },{
                        $set:{
                            'features.$.value': editedFeature.value,
                            'features.$.ENvalue': editedFeature.ENvalue
                        }
                    })
                    .exec();
                }));

            }

            if(req.body.inserted && req.body.inserted.length > 0){
                let newFeautures = [];
                await Promise.all(req.body.inserted.map(async(newFeature) => {
                    if(newFeature.value && newFeature.ENvalue){

                        await productModel
                        .findOneAndUpdate({
                            _id: req.body.productId
                        },{
                            $push: {features: newFeature}
                        })
                        .exec();
                    }
                }));
 
            }

            let proUpdated = await productModel
            .findOne({
                _id: req.body.productId 
            })
            .exec();
            
            return res.status(200).json(proUpdated);

        }else{
            return res.status(400).json({message: 'محصولی با این مشخصات یافت نشد', messageEN: 'Product not found'});
        }
        
    }else{
        return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
    }

});

router.post('/productEdit/installationArea', async (req, res) => {

    // "FAQ": 
    // "review": [],
   
    if(req.body.productId){

        let pro = await productModel
        .findOne({
            _id: req.body.productId 
        })
        .exec();

        if(pro){

            if(req.body.deleted_ids && req.body.deleted_ids.length > 0){

                await Promise.all(req.body.deleted_ids.map(async(area_id) => {
                    await productModel
                    .updateMany({
                        _id: req.body.productId
                    },{ 
                        "$pull": { 
                            "installationarea": { "_id": area_id } 
                        }
                    })
                    .exec();
                }));
            }

            if(req.body.edited && req.body.edited.length > 0){

                await Promise.all(req.body.edited.map(async (editedArea) => {

                    await productModel
                    .findOneAndUpdate({
                        _id: req.body.productId,
                        installationarea:{
                            $elemMatch:{_id: editedArea._id}
                        }
                    },{
                        $set:{
                            'installationarea.$.name': editedArea.name,
                            'installationarea.$.title': editedArea.title,
                            'installationarea.$.ENtitle': editedArea.ENtitle
                        }
                    })
                    .exec();
                }));

            }

            if(req.body.inserted && req.body.inserted.length > 0){
                
                await Promise.all(req.body.inserted.map(async(newArea) => {
                    if(newArea.title && newArea.ENtitle && newArea.name){

                        await productModel
                        .findOneAndUpdate({
                            _id: req.body.productId
                        },{
                            $push: {installationarea: newArea}
                        })
                        .exec();
                    }
                }));
 
            }

            let proUpdated = await productModel
            .findOne({
                _id: req.body.productId 
            })
            .exec();
            
            return res.status(200).json(proUpdated);

        }else{
            return res.status(400).json({message: 'محصولی با این مشخصات یافت نشد', messageEN: 'Product not found'});
        }
        
    }else{
        return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
    }

});

router.post('/productEdit/FAQ', async (req, res) => {

    // "FAQ": 
    // "review": [],
   
    if(req.body.productId){

        let pro = await productModel
        .findOne({
            _id: req.body.productId 
        })
        .exec();

        if(pro){

            if(req.body.deleted_ids && req.body.deleted_ids.length > 0){

                await Promise.all(req.body.deleted_ids.map(async(FAQ_id) => {
                    await productModel
                    .updateMany({
                        _id: req.body.productId
                    },{ 
                        "$pull": { 
                            "FAQ": { "_id": FAQ_id } 
                        }
                    })
                    .exec();
                }));
            }

            if(req.body.edited && req.body.edited.length > 0){

                await Promise.all(req.body.edited.map(async (editedFAQ) => {

                    await productModel
                    .findOneAndUpdate({
                        _id: req.body.productId,
                        FAQ:{
                            $elemMatch:{_id: editedFAQ._id}
                        }
                    },{
                        $set:{
                            'FAQ.$.question': editedFAQ.question,
                            'FAQ.$.answer': editedFAQ.answer
                        }
                    })
                    .exec();
                }));

            }

            if(req.body.inserted && req.body.inserted.length > 0){
                
                await Promise.all(req.body.inserted.map(async(newFAQ) => {
                    if(newFAQ.question && newFAQ.answer){

                        await productModel
                        .findOneAndUpdate({
                            _id: req.body.productId
                        },{
                            $push: {FAQ: newFAQ}
                        })
                        .exec();
                    }
                }));
 
            }

            let proUpdated = await productModel
            .findOne({
                _id: req.body.productId 
            })
            .exec();
            
            return res.status(200).json(proUpdated);

        }else{
            return res.status(400).json({message: 'محصولی با این مشخصات یافت نشد', messageEN: 'Product not found'});
        }
        
    }else{
        return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
    }

});

router.post('/productEdit/ENFAQ', async (req, res) => {

    // "FAQ": 
    // "review": [],
   
    if(req.body.productId){

        let pro = await productModel
        .findOne({
            _id: req.body.productId 
        })
        .exec();

        if(pro){

            if(req.body.deleted_ids && req.body.deleted_ids.length > 0){

                await Promise.all(req.body.deleted_ids.map(async(FAQ_id) => {
                    await productModel
                    .updateMany({
                        _id: req.body.productId
                    },{ 
                        "$pull": { 
                            "ENfaq": { "_id": FAQ_id } 
                        }
                    })
                    .exec();
                }));
            }

            if(req.body.edited && req.body.edited.length > 0){

                await Promise.all(req.body.edited.map(async (editedFAQ) => {

                    await productModel
                    .findOneAndUpdate({
                        _id: req.body.productId,
                        ENfaq:{
                            $elemMatch:{_id: editedFAQ._id}
                        }
                    },{
                        $set:{
                            'ENfaq.$.question': editedFAQ.question,
                            'ENfaq.$.answer': editedFAQ.answer
                        }
                    })
                    .exec();
                }));

            }

            if(req.body.inserted && req.body.inserted.length > 0){
                
                await Promise.all(req.body.inserted.map(async(newFAQ) => {
                    if(newFAQ.question && newFAQ.answer){

                        await productModel
                        .findOneAndUpdate({
                            _id: req.body.productId
                        },{
                            $push: {ENfaq: newFAQ}
                        })
                        .exec();
                    }
                }));
 
            }

            let proUpdated = await productModel
            .findOne({
                _id: req.body.productId 
            })
            .exec();
            
            return res.status(200).json(proUpdated);

        }else{
            return res.status(400).json({message: 'محصولی با این مشخصات یافت نشد', messageEN: 'Product not found'});
        }
        
    }else{
        return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
    }

});

router.post('/productEdit/attributes', async (req, res) => {

    // "FAQ": 
    // "review": [],
   
    if(req.body.productId){

        let pro = await productModel
        .findOne({
            _id: req.body.productId 
        })
        .exec();

        if(pro){

            //delete the whole attribute
            if(req.body.deleted_ids && req.body.deleted_ids.length > 0){

                await Promise.all(req.body.deleted_ids.map(async(attr_id) => {

                    let attr = await pro.attributes.find(attribute => attribute._id.toString() === attr_id);

                    if(attr && attr.values && attr.values.length > 0){

                        await Promise.all(attr.values.map(async (val) => {

                            let lu_ = await lookup
                            .find({
                                product_id: pro._id
                            })
                            .exec();

                            await Promise.all(lu_.map(async(lu) => {

                                if(lu && lu.models && lu.models.length > 0){

                                    await Promise.all(lu.models.map(async(model) => {

                                        await Promise.all(model.attrs.map(async (at) =>{

                                            let at_ = at.replace(/\s+/g, '');;
                                            let valTitle_ = val.name.replace(/\s+/g, '');;
                                            if(at_.toLowerCase() === valTitle_.toLowerCase()){
                                                model.attrs = model.attrs.filter(item => item !== at);
                                                //await lu.save();
                                                
                                            }
                                        }));
                                        
                                    }));

                                    lu.save()
                                    .then()
                                    .catch(err=> {
                                        console.log(err);
                                    })
                                }
                            }));

                        }));

                        pro.attributes = await pro.attributes.filter(attribute => attribute._id.toString() !== attr_id);
                        await pro.save();
                    }
                    
                }));
            }

            //delete some values form attributes
            if(req.body.deleted_ids_values && req.body.deleted_ids_values.length > 0){

                let lu_ = await lookup
                    .find({
                        product_id: pro._id
                    })
                    .exec();

                await Promise.all(req.body.deleted_ids_values.map(async(value_id) => {

                    let attr = await pro.attributes.find(attribute => attribute.values.find(val => val._id.toString() === value_id));

                    if(attr && attr.values && attr.values.length > 0){

                        await Promise.all(attr.values.map(async (val) => {

                            if(val._id.toString() === value_id){

                                await Promise.all(lu_.map(async(lu) => {

                                    if(lu && lu.models && lu.models.length > 0){
    
                                        await Promise.all(lu.models.map(async(model) => {
    
                                            await Promise.all(model.attrs.map(async (at) =>{
    
                                                let at_ = at.replace(/\s+/g, '');;
                                                let valTitle_ = val.name.replace(/\s+/g, '');;
                                                if(at_.toLowerCase() === valTitle_.toLowerCase()){

                                                    model.attrs = model.attrs.filter(item => item !== at);

                                                }
                                            }));
                                            
                                        }));
    
                                        await lu.save();
                                    }
                                }));
                            }

                            attr.values = await attr.values.filter(val => val._id.toString() !== value_id);

                        }));

                        await pro.save();
                    }
                    
                }));
            }

            if(req.body.edited && req.body.edited.length > 0){

                await Promise.all(req.body.edited.map(async (editedFeature) => {

                    let attr = await pro.attributes.find(attr_ => attr_._id.toString() === editedFeature._id);

                    if(attr){

                        let value_ = await attr.values.find(val => val._id.toString() === editedFeature.valueId);
                        value_.name = editedFeature.valueName;
                        value_.title = editedFeature.valueTitle;
                        value_.isDefault = editedFeature.isDefault;

                        await pro.save();
                    }

                }));

            }

            let proUpdated = await productModel
            .findOne({
                _id: req.body.productId 
            })
            .exec();
            
            return res.status(200).json(proUpdated);

        }else{
            return res.status(400).json({message: 'محصولی با این مشخصات یافت نشد', messageEN: 'Product not found'});
        }
        
    }else{
        return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
    }

});

router.post('/productEdit/properties', async (req, res) => {

    // "FAQ": 
    // "review": [],
   
    if(req.body.productId){

        let pro = await productModel
        .findOne({
            _id: req.body.productId 
        })
        .exec();

        if(pro){

            if(req.body.deleted_ids && req.body.deleted_ids.length > 0){

                await Promise.all(req.body.deleted_ids.map(async(property_id) => {
                    await productModel
                    .updateMany({
                        _id: req.body.productId
                    },{ 
                        "$pull": { 
                            "properties": { "_id": property_id } 
                        }
                    })
                    .exec();
                }));
            }

            if(req.body.edited && req.body.edited.length > 0){

                await Promise.all(req.body.edited.map(async (editedFeature) => {

                    await productModel
                    .findOneAndUpdate({
                        _id: req.body.productId,
                        properties:{
                            $elemMatch:{_id: editedFeature._id}
                        }
                    },{
                        $set:{
                            'properties.$.value': editedFeature.value,
                            'properties.$.ENvalue': editedFeature.ENvalue,
                            'properties.$.title': editedFeature.title,
                            'properties.$.ENtitle': editedFeature.ENtitle,
                            'properties.$.categoryId': editedFeature.categoryId
                        }
                    })
                    .exec();
                }));

            }

            if(req.body.inserted && req.body.inserted.length > 0){
                
                await Promise.all(req.body.inserted.map(async(newProp) => {
                    if(newProp.title && newProp.ENtitle && newProp.value && newProp.ENvalue && newProp.name && newProp.categoryId){

                        await productModel
                        .findOneAndUpdate({
                            _id: req.body.productId
                        },{
                            $push: {properties: newProp}
                        })
                        .exec();
                    }
                }));
 
            }

            let proUpdated = await productModel
            .findOne({
                _id: req.body.productId 
            })
            .exec();
            
            return res.status(200).json(proUpdated);

        }else{
            return res.status(400).json({message: 'محصولی با این مشخصات یافت نشد', messageEN: 'Product not found'});
        }
        
    }else{
        return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
    }

});

router.post('/insertProduct/files', upload.fields([{name:'catalog', maxCount: 1}, 
                                            {name:'ENcatalog', maxCount: 1}, 
                                            {name:'usermanual', maxCount: 1},
                                            {name:'ENusermanual', maxCount: 1}]), async(req, res) => {

        if(req.body.productId && req.body.files){

            let pro = await productModel
            .findOne({
                _id: req.body.productId
            })
            .exec();

            if(pro){

                if(req.body.EditCatalog !== undefined && 
                    (req.body.EditCatalog === true || req.body.EditCatalog === 'true') && req.body.files['catalog']){

                    let dataPathImg = '';
                    var splitted = req.files['catalog'][0].path.split(keys.lastDir);
                    if(splitted[1]){
                        dataPathImg = splitted[1];
                    } else{
                        dataPathImg = req.files['catalog'].path;
                    }

                    let catalog = {
                        data: dataPathImg,
                        contentType: req.files['catalog'].mimetype
                    }

                    pro.catalog = [];
                    pro.catalog = [catalog];

                    const log = new editLogModel({
                        field: "catalog",
                        before: '-',
                        after: '-'
                    });

                    log.save();
                }

                if(req.body.EditENCatalog !== undefined && 
                    (req.body.EditENCatalog === true || req.body.EditENCatalog === 'true') && req.body.files['ENcatalog']){

                    let dataPathImg = '';
                    var splitted = req.files['ENcatalog'][0].path.split(keys.lastDir);
                    if(splitted[1]){
                        dataPathImg = splitted[1];
                    } else{
                        dataPathImg = req.files['ENcatalog'].path;
                    }

                    let ENcatalog = {
                        data: dataPathImg,
                        contentType: req.files['ENcatalog'].mimetype
                    }

                    pro.ENcatalog = [];
                    pro.ENcatalog = [ENcatalog];

                    const log = new editLogModel({
                        field: "ENcatalog",
                        before: '-',
                        after: '-'
                    });

                    log.save();
                }

                if(req.body.Editusermanual !== undefined && 
                    (req.body.Editusermanual === true || req.body.Editusermanual === 'true') && req.body.files['usermanual']){

                    let dataPathImg = '';
                    var splitted = req.files['usermanual'][0].path.split(keys.lastDir);
                    if(splitted[1]){
                        dataPathImg = splitted[1];
                    } else{
                        dataPathImg = req.files['usermanual'].path;
                    }

                    let usermanual = {
                        data: dataPathImg,
                        contentType: req.files['usermanual'].mimetype
                    }

                    pro.usermanual = [];
                    pro.usermanual = [usermanual];

                    const log = new editLogModel({
                        field: "usermanual",
                        before: '-',
                        after: '-'
                    });

                    log.save();
                }

                if(req.body.EditENusermanual !== undefined && 
                    (req.body.EditENusermanual === true || req.body.EditENusermanual === 'true') && req.body.files['ENusermanual']){

                    let dataPathImg = '';
                    var splitted = req.files['ENusermanual'][0].path.split(keys.lastDir);
                    if(splitted[1]){
                        dataPathImg = splitted[1];
                    } else{
                        dataPathImg = req.files['ENusermanual'].path;
                    }

                    let ENusermanual = {
                        data: dataPathImg,
                        contentType: req.files['ENusermanual'].mimetype
                    }

                    pro.ENusermanual = [];
                    pro.ENusermanual = [ENusermanual];

                    const log = new editLogModel({
                        field: "ENusermanual",
                        before: '-',
                        after: '-'
                    });

                    log.save();
                }

                await pro.save();
            }

            const charger = await productModel
            .findOne({
                _id: req.body.productId
            })
            .exec();

            return res.status(200).json(charger);
    
        }else{
            return res.status(400).json('خطا در پارامترهای ورودی');
        }
    
});

router.post('/productEdit', upload.fields([{name:'image', maxCount: 1}, 
                                            {name:'catalog', maxCount: 1}, 
                                            {name:'ENcatalog', maxCount: 1}, 
                                            {name:'usermanual', maxCount: 1},
                                            {name:'productModel', maxCount: 1}]), async (req, res) => {

    // "FAQ": 
    // "review": [],
   
    if(req.body._id){

        let pro = await productModel
        .findOne({
            _id: req.body._id 
        })
        .exec();

        if(pro){

            if(req.body.active !== undefined && req.body.active !== '' && typeof(req.body.active) === 'boolean' &&
                pro.active !== req.body.active){

                const log = new editLogModel({
                    productId:req.body._id,
                    field: "active",
                    before: pro.active,
                    after: req.body.active
                });

                pro.active = req.body.active;
                await log.save();
                
            }

            if(req.body.UploadDoc !== undefined && req.body.UploadDoc !== '' && 
                typeof(req.body.UploadDoc) === 'boolean' &&
                pro.UploadDoc !== req.body.UploadDoc){
                
                const log = new editLogModel({
                    productId:req.body._id,
                    field: "UploadDoc",
                    before: pro.UploadDoc,
                    after: req.body.UploadDoc
                });

                pro.UploadDoc = req.body.UploadDoc;
                await log.save();
            }

            if(req.body.name && req.body.name !== '' && req.body.name.length > 0 &&
                pro.name !== req.body.name){

                const log = new editLogModel({
                    productId:req.body._id,
                    field: "name",
                    before: pro.name,
                    after: req.body.name
                });

                pro.name = req.body.name;
                await log.save();
            }

            if(req.body.ENname && req.body.ENname !== '' && req.body.ENname.length > 0 &&
                pro.ENname !== req.body.ENname){

                const log = new editLogModel({
                    productId:req.body._id,
                    field: "ENname",
                    before: pro.ENname,
                    after: req.body.ENname
                });

                pro.ENname = req.body.ENname;
                await log.save();
            }

            if(req.body.product_model && req.body.product_model !== '' && req.body.product_model.length > 0 &&
                pro.product_model !== req.body.product_model){
                
                    const log = new editLogModel({
                        productId:req.body._id,
                        field: "product_model",
                        before: pro.product_model,
                        after: req.body.product_model
                    });
    
                    pro.product_model = req.body.product_model;
                    await log.save();
            }

            if(req.body.price && req.body.price !== undefined && parseInt(req.body.price) > 0 &&
                pro.price !== req.body.price){
                
                    const log = new editLogModel({
                        productId:req.body._id,
                        field: "price",
                        before: pro.price,
                        after: req.body.price
                    });
    
                    pro.price = req.body.price;
                    await log.save();
            }

            if(req.body.discount && req.body.discount !== '' && req.body.discount !== pro.discount &&
                pro.discount !== req.body.discount){

                                
                    const log = new editLogModel({
                        productId:req.body._id,
                        field: "discount",
                        before: pro.discount,
                        after: req.body.discount
                    });
    
                pro.discount = req.body.discount;
                const afterdiscount = parseInt(pro.price) - (parseInt(pro.price) * (pro.discount / 100));
                pro.afterdiscount = afterdiscount;
                await log.save();
            }

            if(req.body.profit && req.body.profit !== '' && parseInt(req.body.profit) > 0 &&
                parseInt(pro.profit) !== parseInt(req.body.profit)){

                const log = new editLogModel({
                    productId:req.body._id,
                    field: "profit",
                    before: pro.profit,
                    after: req.body.profit
                });
    
                pro.profit = req.body.profit;
                await log.save();
            }

            if(req.body.description && req.body.description !== '' && req.body.description.length > 0 && 
            req.body.description !== pro.description){
                
                const log = new editLogModel({
                    productId:req.body._id,
                    field: "description",
                    before: pro.description,
                    after: req.body.description
                });
    
                pro.description = req.body.description;
                await log.save();
            }

            if(req.body.InstallationPrice && req.body.InstallationPrice !== '' && 
                parseInt(req.body.InstallationPrice) >= 0 &&
                parseInt(pro.InstallationPrice) !== parseInt(req.body.InstallationPrice)){
                
                const log = new editLogModel({
                    productId:req.body._id,
                    field: "InstallationPrice",
                    before: pro.InstallationPrice,
                    after: req.body.InstallationPrice
                });
    
                pro.InstallationPrice = req.body.InstallationPrice;
                await log.save();
            }

            if(req.body.deliveryPrice && req.body.deliveryPrice !== '' && parseInt(req.body.deliveryPrice) >= 0 &&
                parseInt(pro.deliveryPrice) !== parseInt(req.body.deliveryPrice)){
                
                const log = new editLogModel({
                    productId:req.body._id,
                    field: "deliveryPrice",
                    before: pro.deliveryPrice,
                    after: req.body.deliveryPrice
                });
    
                pro.deliveryPrice = req.body.deliveryPrice;
                await log.save();
            }

            if(req.body.descriptionproduct && req.body.descriptionproduct !== '' && 
                req.body.descriptionproduct.length >0 && req.body.descriptionproduct !== pro.descriptionproduct){
                
                const log = new editLogModel({
                    productId:req.body._id,
                    field: "descriptionproduct",
                    before: pro.descriptionproduct,
                    after: req.body.descriptionproduct
                });
    
                pro.descriptionproduct = req.body.descriptionproduct;
                await log.save();
            }

            if(req.body.ENdescription && req.body.ENdescription !== '' && req.body.ENdescription.length > 0 &&
            req.body.ENdescription !== pro.ENdescription){
               
                const log = new editLogModel({
                    productId:req.body._id,
                    field: "ENdescription",
                    before: pro.ENdescription,
                    after: req.body.ENdescription
                });
    
                pro.ENdescription = req.body.ENdescription;
                await log.save(); 
            }

            if(req.body.ENdescriptionproduct && req.body.ENdescriptionproduct !== '' &&
             req.body.ENdescriptionproduct.length > 0 && req.body.ENdescriptionproduct !== pro.ENdescriptionproduct){
                
                const log = new editLogModel({
                    productId:req.body._id,
                    field: "ENdescriptionproduct",
                    before: pro.ENdescriptionproduct,
                    after: req.body.ENdescriptionproduct
                });
    
                pro.ENdescriptionproduct = req.body.ENdescriptionproduct;
                await log.save();
            }

            if(req.body.shortdescription && req.body.shortdescription !== '' && req.body.shortdescription.length > 0){
                pro.shortdescription = [];
                pro.shortdescription = req.body.shortdescription.split(/,|،/);
            }

            if(req.body.ENshortdescription && req.body.ENshortdescription !== '' && req.body.ENshortdescription.length > 0){
                pro.ENshortdescription = [];
                pro.ENshortdescription = req.body.ENshortdescription.split(/,|،/);
            }

            if(req.body.installationarea && 
                req.body.installationarea !== ''){

                let areas = JSON.parse(req.body.installationarea);
                let areaValidation = await installationareaValidation(areas);

                if(areaValidation !== false){
                    pro.installationarea = areas;
                }
            }

            if(req.body.features && req.body.features !== '' && 
                req.body.features.length > 0){

                let featureVal = await featuresValidation(req.body.features);
                if(featureVal !== false){

                    pro.features = [];
                    pro.features = req.body.features;
                }

            }

            if(req.body.properties && req.body.properties !== '' && 
                req.body.properties.length > 0 ){
                    
                let propValidation = await propertiesValidation(properties);

                if(propValidation !== false){

                    pro.properties = [];
                    pro.properties = req.body.properties;
                }
 
            }

            if(req.body.attributes && req.body.attributes !== '' && 
                req.body.attributes.length > 0){

                let attrValidation = await attributesValidation(req.body.attributes);

                if(attrValidation !== false){
                    pro.attributes = [];
                    pro.attributes = req.body.attributes;
                }

            }

            if(req.body.files){
                
                if(req.body.EditProductImg !== undefined && typeof(req.body.EditProductImg) === 'boolean' && req.body.EditProductImg === true && req.body.files['image']){

                    let dataPathImg = '';
                    var splitted = req.files['image'][0].path.split(keys.lastDir);
                    if(splitted[1]){
                        dataPathImg = splitted[1];
                    } else{
                        dataPathImg = req.files['image'].path;
                    }

                    let img = {
                        data: dataPathImg,
                        contentType: req.files['image'].mimetype
                    }

                    pro.img = [];
                    pro.img = [img];

                    const log = new editLogModel({
                        field: "img",
                        before: '-',
                        after: '-'
                    });

                    log.save();
                }

                if(req.body.EditCatalog !== undefined && 
                    typeof(req.body.EditCatalog) === 'boolean' && 
                    req.body.EditCatalog === true && 
                    req.body.files['catalog']){

                    let dataPathImg = '';
                    var splitted = req.files['catalog'].path.split(keys.lastDir);
                    if(splitted[1]){
                        dataPathImg = splitted[1];
                    } else{
                        dataPathImg = req.files['catalog'].path;
                    }

                    let catalog = {
                        data: dataPathImg,
                        contentType: req.files['catalog'].mimetype
                    }

                    pro.catalog = [];
                    pro.catalog = [catalog];

                    const log = new editLogModel({
                        field: "catalog",
                        before: '-',
                        after: '-'
                    });

                    log.save();
                }

                if(req.body.EditENcatalog !== undefined && 
                    typeof(req.body.EditENcatalog) === 'boolean' && 
                    req.body.EditENcatalog === true && 
                    req.body.files['ENcatalog']){

                    let dataPathImg = '';
                    var splitted = req.files['ENcatalog'].path.split(keys.lastDir);
                    if(splitted[1]){
                        dataPathImg = splitted[1];
                    } else{
                        dataPathImg = req.files['ENcatalog'].path;
                    }

                    let ENcatalog = {
                        data: dataPathImg,
                        contentType: req.files['ENcatalog'].mimetype
                    }

                    pro.ENcatalog = [];
                    pro.ENcatalog = [ENcatalog];

                    const log = new editLogModel({
                        field: "ENcatalog",
                        before: '-',
                        after: '-'
                    });

                    log.save();

                }

                if(req.body.EditUsermanual !== undefined && 
                    typeof(req.body.EditUsermanual) === 'boolean' && 
                    req.body.EditUsermanual === true && 
                    req.body.files['usermanual']){

                    let dataPathImg = '';
                    var splitted = req.files['usermanual'].path.split(keys.lastDir);
                    if(splitted[1]){
                        dataPathImg = splitted[1];
                    } else{
                        dataPathImg = req.files['usermanual'].path;
                    }

                    let usermanual = {
                        data: dataPathImg,
                        contentType: req.files['usermanual'].mimetype
                    }

                    pro.usermanual = [];
                    pro.usermanual = [usermanual];

                    const log = new editLogModel({
                        field: "usermanual",
                        before: '-',
                        after: '-'
                    });

                    log.save();
                }

                if(req.body.EditproductModel !== undefined && 
                    typeof(req.body.EditproductModel) === 'boolean' && 
                    req.body.EditproductModel === true && 
                    req.body.files['productModel']){

                    let dataPathImg = '';
                    var splitted = req.files['productModel'].path.split(keys.lastDir);
                    if(splitted[1]){
                        dataPathImg = splitted[1];
                    } else{
                        dataPathImg = req.files['productModel'].path;
                    }

                    let model = {
                        data: dataPathImg,
                        contentType: req.files['productModel'].mimetype
                    }

                    pro.model = [];
                    pro.model = [model];

                    const log = new editLogModel({
                        field: "model",
                        before: '-',
                        after: '-'
                    });

                    log.save();
                }
                
            }

            await pro.save();
            return res.status(200).json(pro);

        }else{
            return res.status(400).json({message: 'محصولی با این مشخصات یافت نشد', messageEN: 'Product not found'});
        }
        
    }else{
        return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
    }

});

router.get('/categoryList', async(req, res) => {

    let categories = await category
    .find()
    .lean()
    .exec();

    return res.status(200).json(categories);

});

router.post('/hideProduct', passport.authenticate('jwt', {
    session: false}), async (req, res) => {

        if(req.body.productId && mongoose.Types.ObjectId.isValid(req.body.productId) &&
            typeof(req.body.hide) === 'boolean'){

            let product = await productModel
            .findOneAndUpdate({
                _id: req.body.productId
            },
            {
                hide: req.body.hide
            },
            {
                new: true
            })
            .exec();

            return res.status(200).json(product);

        }else{
            return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
        }
});

router.post('/activeProduct', passport.authenticate('jwt', {
    session: false}), async (req, res) => {

        if(req.body.productId && mongoose.Types.ObjectId.isValid(req.body.productId)){

            let product = '';
                if(typeof(req.body.active) === 'boolean'){

                    product = await productModel
                    .findOneAndUpdate({
                        _id: req.body.productId
                    },
                    {
                        active: req.body.active
                    },
                    {
                        new: true
                    })
                    .exec();
                }

                if(typeof(req.body.activeproduct) === 'boolean'){

                    product = await productModel
                    .findOneAndUpdate({
                        _id: req.body.productId
                    },
                    {
                        activeproduct: req.body.activeproduct
                    },
                    {
                        new: true
                    })
                    .exec();
                }

            

            return res.status(200).json(product);

        }else{
            return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
        }
});

router.post('/similarProducts', async (req, res) => {

    if(req.body.productId && mongoose.Types.ObjectId.isValid(req.body.productId)){

        let product = await productModel
        .findOne({
            _id: req.body.productId
        })
        .lean()
        .exec();

        if(product){

            if(product.product_model && product.product_model.length > 0){

                let products = await productModel
                .find(
                    {
                        parentId: product.parentId
                    }
                )
                .exec();

                await Promise.all(products.map(pro => {
                    
                    if(pro._id.toString() === product._id.toString()){
                        let index = products.indexOf(pro);
                        products.splice(index, 1);
                    }
                }));

                return res.status(200).json(products);

            }else{
                return res.status(400).json({message: 'خطا! کالا سطح آخر نمی باشد', messageEN: "Error! The product should be last level"});
            }
        }else{
            return res.status(400).json({message: 'کالایی با این مشخصات یافت نشد', messageEN: 'Product not found'});
        }
    }
});

router.post('/newCategory', passport.authenticate('jwt', {
    session: false}), async (req, res) => {

        let cat = new category({
            name: req.body.name,
            ENname: req.body.ENname
        });

        await cat.save();

        let cats = await category
        .find()
        .lean()
        .exec();

        return res.status(200).json(cats);
});

router.post('/editCategory', passport.authenticate('jwt', {
    session: false}), async (req, res) => {

        if(req.body.categoryId && mongoose.Types.ObjectId.isValid(req.body.categoryId)){

            let catt = await category
            .findOne({
                _id: req.body.categoryId
            })
            .exec();

            if(req.body.name && req.body.name.length > 0){
                catt.name = req.body.name;
            }

            if(req.body.ENname && req.body.ENname.length > 0){
                catt.ENname = req.body.ENname;
            }

            catt.save()
            .then(cat => {
                return res.status(200).json(cat);
            });

        }else{
            return res.status(400).json({message: 'خطا در پارامترهای ورودی', messageEN: 'Invalid input'});
        }
});

router.get('/categories/getAll', async(req, res) => {
    
    let cats = await category
    .find()
    .lean()
    .exec();

    cats.push({
        _id: -1,
        name:"سایر",
        ENname: "else"
    });

    return res.status(200).json(cats);
});

router.post('/categories/titles', async(req, res) => {

    if(req.body.categoryId){

        let products = await productModel
        .find({
            properties:{
                $elemMatch:{
                    categoryId: req.body.categoryId
                }
            }
        })
        .lean()
        .exec();

        let titles = new Set();
        let titles_ = []
        let titlesObj = [];
        let finalTitles = [];
        await Promise.all(products.map(async(pro) => {

            if(pro && pro.properties)
            {
                let pros = await pro.properties.filter(proo => proo.categoryId && proo.categoryId.toString() === req.body.categoryId);
    
                await Promise.all(pros.map(proo => {

                    if(!proo.ENtitle || proo.ENtitle.length <= 0){
                        proo.ENtitle = proo.name;
                    }

                    titles.add(proo.title);
                    titlesObj.push({
                        title: proo.title,
                        ENtitle: proo.ENtitle,
                        name: proo.name
                    });
                }));

            }
        }));

        titles_ = Array.from(titles);

        await Promise.all(titles_.map(title => {
            let t = titlesObj.find(t_ => t_.title === title);
            if(t){
                finalTitles.push(t);
            }
        }));
        
        finalTitles.push({
            title: 'سایر',
            ENtitle: 'else',
            name: 'else'
        });

        return res.status(200).json({titles: finalTitles});

    }else{
        return res.status(400).json('خطا در پارامترهای ورودی');
    }
})

router.post('/attributeField/new', async (req, res) => {

    if(req.body.name && req.body.title && req.body.values){

        let fields = await attributeField
        .find()
        .exec();

        if(fields){

            let field = await fields.find(fl => 
                fl.name.toString().toLowerCase() === req.body.name.toString().toLowerCase()
            );

            if(field){

                await Promise.all(req.body.values.map(async (val) => {

                    await attributeField
                    .findOneAndUpdate({
                        _id: field._id
                    },{
                        $push:{values: {
                            name: val.name,
                            title: val.title
                        }}
                    })
                    .exec();
                }));

                let updatedFields = await attributeField
                .findOne({
                    _id: field._id
                })
                .exec();

                return res.status(200).json(updatedFields);
            }else{

                const newField = new attributeField({
                    name: req.body.name,
                    title: req.body.title,
                    values: req.body.values
                });

                await newField.save();

                return res.status(200).json(newField);
            }
        }

    }else{
        return res.status(400).json({message:'خطا در پارامترهای ورودی'});
    }
});

router.get('/attributeField/get', async (req, res) => {

    let fields = await attributeField
    .find()
    .lean()
    .exec();

    let categories = [];
    let values = [];
    let pureNames = new Set();
    let pureTitles = new Set();

    if(fields){

        await Promise.all(fields.map(async(field) => {
            categories.push({name: field.name, title: field.title});
            values.push({
                name: field.name,
                values: field.values
            });
            //values[field.name] = field.values;
            await Promise.all(field.values.map(fl => {
                pureNames.add(fl.name);
                pureTitles.add(fl.title);
            }))
        }));
    }

    let valsNames = Array.from(pureNames);
    let valsTitles = Array.from(pureTitles);
    return res.status(200).json({categories, values, titles: valsTitles, names: valsNames});

})

module.exports = router;