 
const express = require('express');
const router = express();
const multer = require('multer'); 
const keys = require('../../../config/keys');
const sendemail = require('../email');
const jwt = require('jsonwebtoken');
const lastEuro = require('./../../../models/store/EuroChanged');

var moment = require('moment-jalaali')
moment.loadPersian();

const objectsEqual = (o1, o2) =>{
    if(Object.keys(o1).length === Object.keys(o2).length ){
        let final_result = true;
        Object.keys(o1).forEach(function(p) {
            if(!(p === 'valueTitle' || p === 'attrTitle')) {
                if(o1[p] !== o2[p]) {
                    final_result = false;
                    return;
                }
            }
            
        });

        return final_result;
    }else{
        return false;
    }
}
    
const arraysEqual = (a1, a2) => {
    if(a1.length === a2.length){
        let final_result = true;
        a1.forEach((o, idx) => {
            {
                let result = false;
                let idx2 = 0;
                do{
                    result = false;
                    if(idx2 < a2.length)
                    {
                        result = objectsEqual(o, a2[idx2]);
                    }
                    else{
                        break;
                    }
                    idx2 += 1;
                }while(!result)
        
                if(!result && idx2 >= a2.length)    {
                    final_result =false;
                    return;
                }
                
            };
        })

        return final_result;
        
    }else{
        return false;
    }
}

multer({
    dest: keys.appDir + '/public/storeDocs/'
});
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, keys.appDir + '/public/storeDocs/')
    },
    filename: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            let rnd = Math.random().toString(36).substr(2, 5);
            cb(null, /* file.originalname*/ rnd + file.fieldname + '-' + Date.now());
        } else {
            req.fileValidationError = 'فرمت فایل صحیح نمی‌باشد';
            let rnd = Math.random().toString(36).substr(2, 5);
            cb(null, /* file.originalname*/ rnd + file.fieldname + '-' + Date.now());
        }
        
    }/*, fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            let rnd = Math.random().toString(36).substr(2, 5);
            cb(null, rnd + '-' + Date.now());
        } else {
            req.fileValidationError = 'فرمت فایل صحیح نمی‌باشد';
            let rnd = Math.random().toString(36).substr(2, 5);
            cb(null, rnd + '-' + Date.now());
        }
    }*/
});

let upload = multer({storage: storage});

const operation = require('../../../models/store/operation');
const operationDetail = require('../../../models/store/operationDetail');
const sendsms = require('../sms');
const isEmpty = require('../../../validation/is-empty');
const charger = require('../../../models/store/Chargers');
const passport = require("passport");
const profileModel = require('../../../models/Profile');
const axios = require('axios');

router.post('/addToCart', passport.authenticate("jwt", {
    session: false
  }), async(req, res) => {

    const result_pr = await Promise.all(req.body.map(async(product) => {

        let pr = await charger
            .findOne(
                {
                    _id: product.id
                }
            )
            .lean()
            .exec();

            if(!pr){
                return {
                    status: 400,
                    error: 'یکی از کالاها نامعتبر است'
                }

        }else{

            }

    }));

    if(result_pr && result_pr.length > 0 && result_pr[0] !== undefined && result_pr[0].status === 400){
        return res.status(400).json(result_pr[0].error);
    }else{

        const op = await operation
        .findOne(
            {
                status: 0,
                profileID: req.user._id
            }
        )
        .exec();
    
        if(!op){
    
            let operationObject = new operation({
                status: 0,
                profileID: req.user._id
            });
    
            await operationObject.save();
            let operationDets = [];
            await Promise.all(req.body.map(async(product) => {
    
                if(parseInt(product.quantity) <= 0){
                    return res.status(400).json('خطا در تعداد کالا'); 
                }else{
                    let ch = await charger
                    .findOne(
                        {
                            _id: product.id
                        }
                    )
                    .select({_id: 0, deliveryPrice: 1, attributes: 1})
                    .lean()
                    .exec();
        
                    
        
                    let options_temp = new Map();
                    
                    if(product.options !== undefined){
                        await Promise.all(product.options.map( opt => {

                            if(!options_temp.has(opt.attrID.toString())){

                                options_temp.set(opt.attrID, []);
                            }

                            options_temp.get(opt.attrID).push({
                                attrID: opt.attrID,
                                valueID: opt.valueID,
                                attrTitle: opt.attrTitle,
                                valueTitle: opt.valueTitle,
                                valueName: opt.valueName
                            });

                        }));
                    }

                    if(ch && ch.attributes && ch.attributes !== undefined){
                        await Promise.all(ch.attributes.map(async (attr) => {
                            if(attr.force !== undefined && attr.force !== null && attr.force === true && attr.values !== undefined){
                                await Promise.all(attr.values.map(async (attrVal) => {
                                    if(attrVal.isDefault !== undefined && attrVal.isDefault !== null && attrVal.isDefault === true){
                                        
                                        if(!options_temp.has(attr._id.toString())){

                                            options_temp.set(attr._id.toString(), []);

                                            options_temp.get(attr._id.toString()).push({
                                                attrID: attr._id.toString(),
                                                valueID: attrVal._id.toString(),
                                                attrTitle: attr.title,
                                                valueTitle: attrVal.title,
                                                valueName: attrVal.name
                                            });

                                        }
                                        
                                    }
                                }))
                            }
                        }))
                    }

                    let options = [];
                    for (let value of options_temp.values()) {

                        for (let valobj of value){
                            options.push(valobj);
                        }

                    }

                    let isEqual = false;
                    await Promise.all(operationDets.map(async(pr) => {
                        let mainOptions = [];
                        if(pr.options !== undefined){

                            await Promise.all(pr.options.map(opt => {

                                mainOptions.push({
                                    attrID: opt.attrID.toString(),
                                    valueID: opt.valueID.toString(),
                                    attrTitle: opt.attrTitle,
                                    valueTitle: opt.valueTitle,
                                    valueName: opt.valueName
                                });

                            }))
                        }
                        if(arraysEqual(options, mainOptions)){
                            pr.quantity += parseInt(pr.quantity) + parseInt(product.quantity);
                            isEqual = true;
                        }
                    }));


                    if(isEqual !== undefined && isEqual === false){

                        // let deliveryPrice = 0;
                        // if(ch && ch.deliveryPrice !== undefined){
                        //     deliveryPrice = ch.deliveryPrice;
                        // }
            
                        let operationDet = new operationDetail({
            
                            operationID: operationObject._id,
                            productID: product.id,
                            quantity: product.quantity,
                            //price: product.price,
                            //deliveryPrice: deliveryPrice,
                            options: options
                
                        });
                
                        //await operationDet.save();
                        operationDets.push(operationDet);
                    }
                    
                }
                
            }));
            
            //save all documents
            await operationDetail.insertMany(operationDets);

            let res__ = await getOrder(operationObject._id.toString(), req.user._id);
            if(res__.status === 200){
                return res.status(200).send({operation: operationObject, operationDetail: operationDets, operation2: res__.op, operationDetail2: res__.details});
            }  
            //return res.status(200).send({operation: operationObject, operationDetail: operationDets});
    
        }else{
    
            let operationDets = [];
            await Promise.all(req.body.map(async(product) =>{
                
                const dets = await operationDetail
                .find(
                    {
                        operationID: op._id,
                        productID: product.id
                    }
                )
                .select({'options._id': 0})
                .lean()
                .exec();
    
                let ch = await charger
                .findOne(
                    {
                        _id: product.id
                    }
                )
                .select({_id: 0, deliveryPrice: 1, attributes: 1})
                .lean()
                .exec();
    
                let options_temp = new Map();
                    
                if(product.options !== undefined){
                await Promise.all(product.options.map( opt => {
    
                    if(!options_temp.has(opt.attrID.toString())){

                        options_temp.set(opt.attrID, []);
                    }

                    options_temp.get(opt.attrID).push({
                        attrID: opt.attrID,
                        valueID: opt.valueID,
                        attrTitle: opt.attrTitle,
                        valueTitle: opt.valueTitle,
                        valueName: opt.valueName
                    });
    
                }));
                }
                
    
                if(ch && ch.attributes){
                    await Promise.all(ch.attributes.map(async (attr) => {
                        if(attr.force !== undefined && attr.force !== null && attr.force === true){
                            await Promise.all(attr.values.map(async (attrVal) => {
                                if(attrVal.isDefault !== undefined && attrVal.isDefault !== null && attrVal.isDefault === true){
                                            
                                    if(!options_temp.has(attr._id.toString())){
    
                                        options_temp.set(attr._id.toString(), []);

                                        options_temp.get(attr._id.toString()).push({
                                            attrID: attr._id.toString(),
                                            valueID: attrVal._id.toString(),
                                            attrTitle: attr.title,
                                            valueTitle: attrVal.title,
                                            valueName: attrVal.name
                                        });
    
                                    }
                                            
                                }
                            }))
                        }
                    }))
                }
    
                let options = [];

                for (let value of options_temp.values()) {
    
                    for(let valobj of value){
                        options.push(valobj);
                    }
                    
                }

                //compare to itself
                let isEqual = false;
                await Promise.all(operationDets.map(async(pr) => {
                    let mainOptions = [];
                    if(pr.options !== undefined){

                        await Promise.all(pr.options.map(opt => {

                            mainOptions.push({
                                attrID: opt.attrID.toString(),
                                valueID: opt.valueID.toString(),
                                attrTitle: opt.attrTitle,
                                valueTitle: opt.valueTitle,
                                valueName: opt.valueName
                            });

                        }))
                    }
                    if(arraysEqual(options, mainOptions)){
                        pr.quantity += parseInt(pr.quantity) + parseInt(product.quantity);
                        isEqual = true;
                    }
                }));

                if(isEqual !== undefined && isEqual === false){
                    product.options = options;
                    let detail = '';
    
                    await Promise.all(dets.map(async(det) => {
    
                        if(arraysEqual(product.options, det.options)){
                            detail = det;
                        }
                    }));
        
                    if(detail && detail !== ''){
        
        
                        let newQuantity = parseInt(detail.quantity) + parseInt(product.quantity); //1
    
                        if(newQuantity <= 0){
    
                            await operationDetail
                            .findOneAndDelete(
                                {
                                    _id: detail._id
                                }
                            )
                            .exec();
    
                        }else{
    
                            let newDet = await operationDetail
                            .findOneAndUpdate(
                                {
                                    _id: detail._id
                                },
                                {
                                    quantity: newQuantity
                                },
                                {
                                    new: true
                                }
                            )
                            .exec();
                            // if(newDet)
                            //     operationDets.push(newDet);
                        }
    
                    }else{
        
                        if(parseInt(product.quantity) <= 0){
                            return res.status(400).json('خطا در تعداد کالا'); 
                        }else{
                            
                    
                            // let deliveryPrice = 0;
                            // if(ch && ch.deliveryPrice !== undefined){
                            //     deliveryPrice = ch.deliveryPrice;
                            // }
            
                            let operationDet = new operationDetail({
            
                                operationID: op._id,
                                productID: product.id,
                                quantity: product.quantity,
                                //price: product.price,
                                //deliveryPrice: deliveryPrice,
                                options: options
                    
                            });
                    
                            //await operationDet.save();
                            operationDets.push(operationDet);
                        }
                    }
                }
                
            }));

            //save all documents
            await operationDetail.insertMany(operationDets);

            let res__ = await getOrder(op._id.toString(), req.user._id);
            if(res__.status === 200){
                return res.status(200).send({operation: op, operationDetail: operationDets, operation2: res__.op, operationDetail2: res__.details});
            } 
            //return res.status(200).send({operation: op, operationDetail: operationDets}); 
        }
    }

});

router.post('/removeDetail', passport.authenticate("jwt", {
    session: false
  }), async (req, res) => {
    if(req.body.detailID === undefined){
        return res.status(400).json('شناسه سطر سفارش نامعتبر است');
    }else{

        const op = await operation
        .findOne(
            {
                profileID: req.user._id,
                status: 0
            }
        )
        .exec();

        if(op){

            if(op.status !== 0){
                return res.status(400).json('دسترسی برای حذف از سفارش وجود ندارد');
            }else{

                let det = await operationDetail
                .findOneAndDelete(
                    {
                        operationID: op._id,
                        _id: req.body.detailID
                    }
                )
                .exec();
    
                if(!det){
                    return res.status(400).json('کالایی با این مشخصات در سبد خرید یافت نشد');
                }else{

                    let res__ = await getOrder(op._id.toString(), req.user._id);
                    if(res__.status === 200){
                        return res.status(200).send({operation: res__.op, operationDetail: res__.details, text: 'کالا باموفقیت از سبد خرید حذف شد'});
                    }
                    //return res.status(200).json('کالا باموفقیت از سبد خرید حذف شد.');
                }
            }

        }else{
            return res.status(400).json('سبد خریدی برای کاربر یافت نشد');
        }
        
    }
});

router.get('/docHTML', function (req, res) {
    res.sendFile(__dirname + '/status1.html');

});

router.post('/uploadDocs', 
upload.fields([{name:'parkingPic', maxCount: 1}, {name:'powerMeterPic', maxCount: 1}]), 
async(req, res) => {
    console.log(req.body.UploadDoc)
    console.log(typeof(req.body.UploadDoc))

    if(req.body.UploadDoc===true || req.body.UploadDoc==="true") {
        if(req.fileValidationError && req.fileValidationError.length > 0){
            return res.status(400).json('فرمت فایل صحیح نمی‌باشد');
        }else{
            let op = await operation
            .findOne(
                {
                    _id: req.body.operation_id
                }
            )
            .exec();

            if(!op){
                return res.status(400).json('فاکتوری با این مشخصات یافت نشد');
            }else{

                if(parseInt(op.status) === 2){
                    //رفع نقص مدارک
                    if(op.addressStatus === undefined || op.addressStatus === 0){
                        //خطای آدرس
                        if(req.body.address === undefined || req.body.address === null || req.body.address.length <= 0){
                            return res.status(400).json('علت نقص مدارک، خطا در آدرس می‌باشد. اصلاح آدرس اجبار می‌باشد');
                        }
                    }
                    if(op.docs.parkingPic.status !== undefined && op.docs.parkingPic.status !== null && op.docs.parkingPic.status === 0){
                        //خطای عکس پارکینگ
                        if(req.files['parkingPic'] === undefined){
                            return res.status(400).json('علت نقص مدارک، خطا در عکس پارکینگ می‌باشد. اصلاح عکس پارکینگ اجباری می‌باشد');

                        }
                    }

                    if(op.docs.powerMeterPic.status !== undefined && op.docs.powerMeterPic.status !== null && op.docs.powerMeterPic.status === 0){
                        //خطای عکس پارکینگ
                        if(req.files['powerMeterPic'] === undefined){
                            return res.status(400).json('علت نقص مدارک، خطا در عکس پاور متریک می‌باشد. اصلاح عکس پارکینگ اجباری می‌باشد');
                            
                        }
                    }
                    op.status = 1;
                }

                if(req.files['parkingPic']){
                    if (req.files['parkingPic'].size > 5000000)
                        return res.status(400).send('حجم فایل نباید بیشتر از 5 مگابایت باشد');
                    else{
			var splitted = req.files['parkingPic'][0].path.split(keys.lastDir);
			if(splitted[1])
                        	op.docs.parkingPic.path = splitted[1];
			else
				op.docs.parkingPic.path = req.files['parkingPic'][0].path;

                        op.docs.parkingPic.status = 0;
                    }
                }
            
                if(req.files['powerMeterPic']){
                    if (req.files['powerMeterPic'].size > 5000000)
                        return res.status(400).send('حجم فایل نباید بیشتر از 5 مگابایت باشد');
                    else{
			var splitted = req.files['powerMeterPic'][0].path.split(keys.lastDir);
			if(splitted[1])
                        	op.docs.powerMeterPic.path = splitted[1];
			else
				op.docs.powerMeterPic.path = req.files['powerMeterPic'][0].path;
                        op.docs.powerMeterPic.status = 0;
                    }
                }
                
                if(req.body.address && req.body.address.length > 0){
                    op.address = req.body.address;
                }
        
                if(!op.address || (op.address && op.address.length <= 0)){
                    return res.status(400).json('وارد کردن آدرس برای ثبت سفارش اجباری است');
                }

                if(req.body.postalCode && req.body.postalCode.length > 0){
                    op.postalCode = req.body.postalCode;
                }
        
                if(!op.postalCode || (op.postalCode && op.postalCode.length <= 0)){
                    return res.status(400).json('وارد کردن کدپستی برای ثبت سفارش اجباری است');
                }
                //if(req.body.UploadDoc===true) {
                    
               // console.log("true")
               if(op.docs!=undefined || op.docs) {
                    if(!op.docs || (op.docs && (!op.docs.parkingPic || (op.docs.parkingPic && op.docs.parkingPic.path && op.docs.parkingPic.path.length <= 0) ||
                    !op.docs.powerMeterPic || (op.docs.powerMeterPic && op.docs.powerMeterPic.path && op.docs.powerMeterPic.path.length <= 0)))){
                        return res.status(400).json('نقص مدارک');
                    }else{
                        await op.save();
                        return res.status(200).send(op);
                    }
                }
                else{
                    await op.save();
                    return res.status(200).send(op);
                }
            }
        }
    }
    else {
        let op = await operation
        .findOne(
            {
                _id: req.body.operation_id
            }
        )
        .exec();

        if(!op){
            return res.status(400).json('فاکتوری با این مشخصات یافت نشد');
        }else{

            if(parseInt(op.status) === 2){

                //رفع نقص مدارک
                if(op.addressStatus === undefined || op.addressStatus === 0){
                    //خطای آدرس
                    if(req.body.address === undefined || req.body.address === null || req.body.address.length <= 0){
                        return res.status(400).json('علت نقص مدارک، خطا در آدرس می‌باشد. اصلاح آدرس اجبار می‌باشد');
                    }
                }

                op.status = 1;
            }

            if(req.body.address && req.body.address.length > 0){
                op.address = req.body.address;
            }
    
            if(!op.address || (op.address && op.address.length <= 0)){
                return res.status(400).json('وارد کردن آدرس برای ثبت سفارش اجباری است');
            }

            if(req.body.postalCode && req.body.postalCode.length > 0){
                op.postalCode = req.body.postalCode;
            }
    
            if(!op.postalCode || (op.postalCode && op.postalCode.length <= 0)){
                return res.status(400).json('وارد کردن کدپستی برای ثبت سفارش اجباری است');
            }

            op.docs="";

            await op.save();
            return res.status(200).send(op);
        }
    }
})
/**
 * سفارش ثبت و در حال بررسی توسط کارشناسان می باشد.
 * update netCost
 */
router.post('/changeToStatus1', passport.authenticate("jwt", {
    session: false
  }), async(req, res) => {

    let op = await operation
    .findOne(
        {
            _id: req.body.operation_id
        }
    )
    .exec();

    if(!op){
        return res.status(400).json('فاکتوری با این مشخصات یافت نشد');
    }else if(op.status >= 1){
        return res.status(400).json('خطای وضعیت سفارش');
    }/*else if(req.body.netCost === undefined || parseInt(req.body.netCost) === 0){
        return res.status(400).json('خطا در فیلد مبلغ نهایی فاکتور.');
    }*/else{

        op.status = 1;
        //op.netCost = req.body.netCost; // netcost will be updated after pay in status === 3
        op.createDate1 = Date.now();
        
        let op_ = '';
        do{
            op.trackingCode = Math.floor(100000 + Math.random() * 900000);
            op_ = await operation
            .findOne(
                {
                    trackingCode: op.trackingCode
                }
            )
            .exec();

        }while(op_)

        if(!op.address || (op.address && op.address.length <= 0)){
            return res.status(400).json('وارد کردن آدرس برای ثبت سفارش اجباری است');
        }

        
        /*if(op.docs === undefined || 
            (op.docs !== undefined && (op.docs.parkingPic === undefined || (op.docs.parkingPic !== undefined && (op.docs.parkingPic.path === undefined || op.docs.parkingPic.path.length <= 0)) ||
        op.docs.powerMeterPic === undefined || (op.docs.powerMeterPic !== undefined && (op.docs.powerMeterPic.path === undefined  || op.docs.powerMeterPic.path.length <= 0))))){
            return res.status(400).json('نقص مدارک');
        }else{*/

            await op.save();

            const prf = await profileModel
            .findOneAndUpdate(
                {
                    _id: op.profileID
                },
                {
                    $set: { cart: true}
                },
                {
                    new: true
                }
            )
            .lean()
            .exec();

            sendsms("09143551361", op.trackingCode.toString(),"rw4jy50nxy");

            if(prf){
                sendsms(prf.phone, op.trackingCode.toString(),"rw4jy50nxy");

                var html=  '<p dir="rtl">کاربر گرامی ' + prf.namee +
                             '</p><p dir="rtl">سفارش شما ثبت شد و درحال بررسی توسط کارشناسان ما می‌باشد. ' + 
                             '</p><p dir="rtl">پیش فاکتور شما برای سفارش '+ op.trackingCode.toString() ;
                             //'</p> <p dir="rtl">موضوع : ' +contact_info.subject+' </p><p dir="rtl">پیام : '+contact_info.message+'</p>'
                subject='اطلاعات سفارش ';
                subject += op.trackingCode.toString();
                sendemail(html, prf.email, subject);
            }
            
            let new_details = await operationDetail
            .find(
                {
                    operationID: op._id
                }
            )
            .exec();

            return res.status(200).send({operation: op, operationDetail: new_details, profile: prf});
        //}
    }
});

router.post('/updatePrice', passport.authenticate("jwt", {
    session: false
  }), async (req, res) => {

    let op = await operation
    .findOne(
        {
            _id: req.body.operation_id,
            profileID: req.user._id
        }
    )
    .exec();

    if(!op){
        return res.status(400).json('فاکتوری با این مشخصات یافت نشد');
    }else if(op.status !== 3){
        return res.status(400).json('خطای وضعیت سفارش.');
    }else if(op.status === 3 && op.paid === false){
        return res.status(400).json('پرداخت توسط کاربر انجام نشده‌است.');
    }else if(req.body.netCost === undefined || parseInt(req.body.netCost) === 0){
        return res.status(400).json('خطا در فیلد مبلغ نهایی فاکتور');
    }else{

        op.netCost = req.body.netCost;
        op.save();

        if(!req.body.details || req.body.details === undefined){
            return res.status(400).json('ورود مبالغ هر سطر از فاکتور اجباری می‌باشد');
        
        }
    
        //update price for details
        let details = await operationDetail
        .find(
            {
                operationID: op._id
            }
        )
        .exec();
    
        await Promise.all(details.map(async (oldDet) => {
            let newDet = req.body.details.find(det => det.detailID === oldDet._id.toString());
            
            // if(newDet && newDet.price !== undefined && parseInt(newDet.price) > 0){
            //     oldDet.price = parseInt(newDet.price);
            // }

            if(newDet && newDet.priceTotal !== undefined && parseInt(newDet.priceTotal) > 0){
                oldDet.priceTotal = parseInt(newDet.priceTotal);
            }

            if(newDet.tax === undefined){
                oldDet.tax = 0;
            }else{
                oldDet.tax = newDet.tax;
            }

            let product = await charger
            .findOne(
                {
                    _id: oldDet.productID
                }
            )
            .exec();

            let uero = await lastEuro
            .find()
            .exec();

            let EuroVal = uero[0].lastValue;
            if(keys.EuroVal && parseInt(keys.EuroVal) > 0)
            {
                EuroVal = keys.EuroVal;
            }

            if(product){

                for(var k=0; k < product.attributes.length; k++) {

                    product.attributes[k].values.map(pr_attr => {
                        
                        let opt_ = oldDet.options.find(opt => opt.attrID === product.attributes[k]._id.toString() && opt.valueID === pr_attr._id.toString())
                        if(opt_ !== undefined)
                            opt_.price = Math.round((parseFloat(pr_attr.price) * parseFloat(product.profit) * parseInt(EuroVal))/1000)*1000;
                        
                    });

                }

                oldDet.discount = product.discount;
                oldDet.afterdiscount = Math.round((parseFloat(product.afterdiscount) * parseFloat(product.profit) * parseInt(EuroVal))/1000)*1000;
                oldDet.deliveryPrice = product.deliveryPrice;
                oldDet.InstallationPrice = product.InstallationPrice;
                oldDet.price = Math.round((parseFloat(product.price) * parseFloat(product.profit) * parseInt(EuroVal))/1000)*1000;
                

            }

            await oldDet.save();
        }));
    
        let new_details = await operationDetail
        .find(
            {
                operationID: op._id
            }
        )
        .exec();
    
        return res.status(200).send({operation: op, operationDetail: new_details});
    }

})

/**
 * reject operation
 */
router.post('/changeToStatus2', async(req, res) => {
    
    let token = '';
    let user = '';
    if(req.body.params){
        token = req.body.params.Authorization;
        const decoded = jwt.verify(token, keys.secretOrKey);

            user = await userAdmin.findOne(
            {
                _id: decoded.id,
                role: "store"
            }
        )
        .exec();
    }

    if (user){
        let op = await operation
        .findOne(
            {
                _id: req.body.operation_id
            }
        )
        .exec();

        if(!op){
            return res.status(400).json('سفارشی با این مشخصات یافت نشد');
        }else{
            if(op.status === 1 || op.status === 2){

                op.status = 2;
                op.confirmDate3 = Date.now();
        
                if(req.body.rejectDescription && req.body.rejectDescription.length > 0)
                    op.rejectDescription = req.body.rejectDescription;
        
                
                if(req.body.parkingPic && req.body.parkingPic.status)
                    op.docs.parkingPic.status = req.body.parkingPic.status;

                if(req.body.powerMeterPic && req.body.powerMeterPic.status)
                    op.docs.powerMeterPic.status = req.body.powerMeterPic.status;

                if(req.body.addressStatus)
                    op.addressStatus = req.body.addressStatus;

                await op.save();

                const prf = await profileModel
                    .findOne(
                        {
                            _id: op.profileID
                        }
                    )
                    .lean()
                    .exec();

            sendsms("09143551361", op.trackingCode.toString(),"kb9c7kcr1c");

                if(prf){
                    sendsms(prf.phone, op.trackingCode.toString(),"kb9c7kcr1c");
                }

                let res__ = await getOrder(op._id.toString(), prf._id);
                if(res__.status === 200){
                    return res.status(200).send({operation: res__.op, operationDetail: res__.details});
                }   

            }else{
                return res.status(400).json("خطای وضعیت سفارش");
            }
            
        }
    }else{
        return res.status(400).json('شما دسترسی انجام عملیات را ندارید');
    }
    
});

/**
 * confirm operation
 */
router.post('/changeToStatus3', async(req, res) => {

    let token = '';
    let user = '';
    if(req.body.params){
        token = req.body.params.Authorization;
        const decoded = jwt.verify(token, keys.secretOrKey);

            user = await userAdmin.findOne(
            {
                _id: decoded.id,
                role: "store"
            }
        )
        .exec();
    }

    if (user) {
        let op = await operation
        .findOne(
            {
                _id: req.body.operation_id
            }
        )
        .exec();

        if(!op){
            return res.status(400).json('سفارشی با این مشخصات یافت نشد');
        }else{

            //if(op.docs && op.docs.parkingPic.status === 1 && op.docs.powerMeterPic.status === 1 && (op.status === 2 || op.status === 1)){
            if(op.status === 2 || op.status === 1){

                op.status = 3;
                op.rejectDescription = null;
                op.confirmDate3 = Date.now();
                op.docs.parkingPic.status = 1;
                op.docs.powerMeterPic.status = 1;
                op.addressStatus = 1;

                await op.save();

                const prf = await profileModel
                    .findOne(
                        {
                            _id: op.profileID
                        }
                    )
                    .lean()
                    .exec();

            sendsms("09143551361", op.trackingCode.toString(),"nevcv67agq");

                if(prf){
                    sendsms(prf.phone, op.trackingCode.toString(),"nevcv67agq");
                }

                let res__ = await getOrder(op._id.toString(), prf._id);
                if(res__.status === 200){
                    return res.status(200).send({operation: res__.op, operationDetail: res__.details});
                }   

            }else{
                return res.status(400).json("خطای وضعیت سفارش");
            }

        
        }

    }else{
        return res.status(400).json('شما دسترسی انجام عملیات را ندارید');
    }

    
});

/**
 * پرداخت با موفقیت انجام شد و سفارش در حال آماده سازی می‌باشد.
 */
router.post('/changeToStatus4', async(req, res) => {

    let token = '';
    let user = '';
    if(req.body.params){
        token = req.body.params.Authorization;
        const decoded = jwt.verify(token, keys.secretOrKey);

            user = await userAdmin.findOne(
            {
                _id: decoded.id,
                role: "store"
            }
        )
        .exec();
    }

    if (user){
        let op = await operation
        .findOne(
            {
                _id: req.body.operation_id
            }
        )
        .exec();

        if(!op){
            return res.status(400).json('سفارشی با این مشخصات یافت نشد');
        }else if(op.status != 3){
            return res.status(400).json('وضعیت سفارش تایید شده نمی باشد');
        }else if(op.status === 3 && op.paid === false){
            return res.status(400).json('پرداخت توسط کاربر انجام نشده‌است');
        }else{
            
            op.status = 4;

            let deliveryDays = 7;
            if(req.body.expectedDeliveryDays !== undefined && parseInt(req.body.expectedDeliveryDays) > 0){

                deliveryDays = req.body.expectedDeliveryDays;
            }
            op.preparingDate4 = Date.now();
            op.expectedDeliveryDate = Date.now();

            op.expectedDeliveryDate.setDate(op.expectedDeliveryDate.getDate() + parseInt(deliveryDays));
            
            op.expectedDeliveryDays = deliveryDays;

            await op.save();
            
            const prf = await profileModel
            .findOne(
                {
                    _id: op.profileID
                }
            )
            .lean()
            .exec();

            sendsms("09143551361", op.trackingCode.toString(),"lcd3p5nxp7");

            if(prf){
                sendsms(prf.phone, op.trackingCode.toString(),"lcd3p5nxp7");

                var html=  '<p dir="rtl">کاربر گرامی ' + prf.namee +
                            '</p><p dir="rtl">پرداخت شما با موفقیت انجام شد و سفارش شما در حال آماده سازی می‌باشد. ' + 
                            '</p><p dir="rtl"> فاکتور شما برای سفارش '+ op.trackingCode.toString() ;
                            //'</p> <p dir="rtl">موضوع : ' +contact_info.subject+' </p><p dir="rtl">پیام : '+contact_info.message+'</p>'
                subject='اطلاعات سفارش ';
                subject += op.trackingCode.toString();
                sendemail(html, prf.email, subject);
            }

            let res__ = await getOrder(op._id.toString(), prf._id);
            if(res__.status === 200){
                return res.status(200).send({operation: res__.op, operationDetail: res__.details});
            }   

        }
    }else{
        return res.status(400).json('شما دسترسی انجام عملیات را ندارید');
    }
    
});

/**
 * سفارش در حال آماده سازی برای ارسال و نصب می‌باشد.
 */
router.post('/changeToStatus5', async(req, res) => {

    let token = '';
    let user = '';
    if(req.body.params){
        token = req.body.params.Authorization;
        const decoded = jwt.verify(token, keys.secretOrKey);

            user = await userAdmin.findOne(
            {
                _id: decoded.id,
                role: "store"
            }
        )
        .exec();
    }

    if (user){
        let op = await operation
        .findOne(
            {
                _id: req.body.operation_id
            }
        )
        .exec();

        if(!op){
            return res.status(400).json('سفارشی با این مشخصات یافت نشد');
        }else{

            if(op.status === 4){
                op.status = 5;
                op.sendingDate5 = Date.now();

                await op.save();

                const prf = await profileModel
                .findOne(
                    {
                        _id: op.profileID
                    }
                )
                .lean()
                .exec();
        
                sendsms("09143551361", op.trackingCode.toString(),"n81fzc2c19");

                if(prf){
                    sendsms(prf.phone, op.trackingCode.toString(),"n81fzc2c19");
                }
        
                let res__ = await getOrder(op._id.toString(), prf._id);
                if(res__.status === 200){
                    return res.status(200).send({operation: res__.op, operationDetail: res__.details});
                }  
                
                //return res.status(200).send({operation: op, operationDetail: new_details});

            }else{
                return res.status(400).json("خطای وضعیت سفارش و یا مدارک");
            }
        }
    }else{
        return res.status(400).json('شما دسترسی انجام عملیات را ندارید');
    }
    
});

/**
 * سفارش برای نصب ارسال شده است
 */
router.post('/changeToStatus6', async(req, res) => {

    let token = '';
    let user = '';
    if(req.body.params){
        token = req.body.params.Authorization;
        const decoded = jwt.verify(token, keys.secretOrKey);

            user = await userAdmin.findOne(
            {
                _id: decoded.id,
                role: "store"
            }
        )
        .exec();
    }

    if (user){
        let op = await operation
        .findOne(
            {
                _id: req.body.operation_id
            }
        )
        .exec();

        if(!op){
            return res.status(400).json('سفارشی با این مشخصات یافت نشد');
        }else{

            if(op.status === 5){
                op.status = 6;
                op.deliveryDate6 = Date.now();

                await op.save();

                const prf = await profileModel
                .findOne(
                    {
                        _id: op.profileID
                    }
                )
                .lean()
                .exec();
        
                sendsms("09143551361", op.trackingCode.toString(),"ilvjcdspxh");

                if(prf){
                    sendsms(prf.phone, op.trackingCode.toString(),"ilvjcdspxh");
                }
        
                let res__ = await getOrder(op._id.toString(), prf._id);
                if(res__.status === 200){
                    return res.status(200).send({operation: res__.op, operationDetail: res__.details});
                }  

            }else{
                return res.status(400).json("خطای وضعیت سفارش و یا مدارک");
            }
        }
    }else{
        return res.status(400).json('شما دسترسی انجام عملیات را ندارید');
    }
    
});

//نصب انجام شد.
router.post('/changeToStatus7', async(req, res) => {

    let token = '';
    let user = '';
    if(req.body.params){
        token = req.body.params.Authorization;
        const decoded = jwt.verify(token, keys.secretOrKey);

            user = await userAdmin.findOne(
            {
                _id: decoded.id,
                role: "store"
            }
        )
        .exec();
    }

    if (user){
        let op = await operation
        .findOne(
            {
                _id: req.body.operation_id
            }
        )
        .exec();

        if(!op){
            return res.status(400).json('سفارشی با این مشخصات یافت نشد');
        }else{

            if(op.status === 6){
                op.status = 7;
                op.deliveredDate7 = Date.now();

                await op.save();

                const prf = await profileModel
                .findOne(
                    {
                        _id: op.profileID
                    }
                )
                .lean()
                .exec();
        
                sendsms("09143551361", op.trackingCode.toString(),"56zshasgj1");

                if(prf){
                    sendsms(prf.phone, op.trackingCode.toString(),"56zshasgj1");
                }
                
                let res__ = await getOrder(op._id.toString(), prf._id);
                if(res__.status === 200){
                    return res.status(200).send({operation: res__.op, operationDetail: res__.details});
                }  
                
            }else{
                return res.status(400).json("خطای وضعیت سفارش و یا مدارک");
            }
        }
    }else{
        return res.status(400).json('شما دسترسی انجام عملیات را ندارید');
    }
    
});

router.post('/getAllOrders', async(req, res) => {

    let token = '';
    let user = '';
    if(req.body.params){
        token = req.body.params.Authorization;
        const decoded = jwt.verify(token, keys.secretOrKey);

            user = await userAdmin.findOne(
            {
                _id: decoded.id,
                role: "store"
            }
        )
        .exec();
    }

    if (user){
        
        let sort = -1;
        if(req.body.sort !== undefined){
            if(req.body.sort === 1 || req.body.sort === -1){
                sort = req.body.sort;
            }
        }

        let operations = "";
        if(!req.body.status){

            operations = await operation
                .find(
                    {
                        status: {$gt: 0}
                    }
                )
                .sort({createDate1: sort})
                .lean()
                .exec();

        }else{

            operations = await operation
                .find(
                    {
                        status: req.body.status
                    }
                )
                .sort({createDate1: sort})
                .lean()
                .exec();
        }
        
        let details = {};
        Promise.all(
            operations.map(async(op) => {
            
                let prf = await profileModel
                .findOne({
                    _id: op.profileID
                })
                .exec();

                if(prf){
                    op.profileName = prf.namee;
                    op.profilePhone = prf.phone;
                }

                if(op.docs && op.docs.parkingPic && op.docs.parkingPic.path)
                    op.docs.parkingPic.path = op.docs.parkingPic.path.slice(6);
                
                if(op.docs && op.docs.powerMeterPic && op.docs.powerMeterPic.path)
                    op.docs.powerMeterPic.path = op.docs.powerMeterPic.path.slice(6);
                
                let res__ = await getOrder(op._id.toString(), op.profileID.toString());
                if(res__.status === 200){
                    op.details = res__.details;
                }

                let op_det = await operationDetail
                .find(
                    {
                        operationID: op._id
                    }
                )
                .lean()
                .exec();
        
                await Promise.all(
                    op_det.map(async(det) => {
                        let product = await charger
                        .findOne(
                            {
                                _id: det.productID
                            }
                        )
                        .exec();

                        if(product){
                            det.productName = product.name;
                        }
                    })
                );

                details[op._id] = op_det;
            })
        )
        .then(() => {
            return res.status(200).json({operations, details});
        });

    }else{
        return res.status(400).json('شما دسترسی انجام عملیات را ندارید');
    }

    
})

router.post('/getAllReturnedOrders', async(req, res) => {

    let token = '';
    let user = '';
    if(req.body.params){
        token = req.body.params.Authorization;
        const decoded = jwt.verify(token, keys.secretOrKey);

            user = await userAdmin.findOne(
            {
                _id: decoded.id,
                role: "store"
            }
        )
        .exec();
    }

    if (user){
        
        let sort = -1;
        if(req.body.sort !== undefined){
            if(req.body.sort === 1 || req.body.sort === -1){
                sort = req.body.sort;
            }
        }

        let operationsConfirmed2 = {};
        let operationsConfirmed3 = {};
        if(!req.body.status){

            /*(operationsConfirmed2, operationsConfirmed3)*/let ress = await getAllReturnedByConfirmed(sort);
            console.log(ress);
            operationsConfirmed2 = ress.operations2;
            operationsConfirmed3 = ress.operations3;
            
        }else{

            /*(operationsConfirmed2, operationsConfirmed3)*/let ress = await getAllReturnedByConfirmed(sort, req.body.status);
            console.log(ress);
            operationsConfirmed2 = ress.operations2;
            operationsConfirmed3 = ress.operations3;
        }
        
        let detailsConfirmed2 = {};
        let detailsConfirmed3 = {};
        await Promise.all(
            operationsConfirmed2.map(async(op) => {
            
                let prf = await profileModel
                .findOne({
                    _id: op.profileID
                })
                .exec();

                if(prf){
                    op.profileName = prf.namee;
                    op.profilePhone = prf.phone;
                }

                if(op.docs && op.docs.parkingPic && op.docs.parkingPic.path)
                    op.docs.parkingPic.path = op.docs.parkingPic.path.slice(6);
                
                if(op.docs && op.docs.powerMeterPic && op.docs.powerMeterPic.path)
                    op.docs.powerMeterPic.path = op.docs.powerMeterPic.path.slice(6);
                
                let op_det = await operationDetail
                .find(
                    {
                        operationID: op._id
                    }
                )
                .lean()
                .exec();
        
                await Promise.all(
                    op_det.map(async(det) => {
                        let product = await charger
                        .findOne(
                            {
                                _id: det.productID
                            }
                        )
                        .exec();

                        if(product){
                            det.productName = product.name;
                        }
                    })
                );

                let res__ = await getReturnedOrder(op._id.toString(), op.profileID.toString(), 2);
                if(res__.status === 200){
                    op.details = res__.details;
                }

                detailsConfirmed2[op._id] = op_det;
            })
        );

        await Promise.all(
            operationsConfirmed3.map(async(op) => {
            
                let prf = await profileModel
                .findOne({
                    _id: op.profileID
                })
                .exec();

                if(prf){
                    op.profileName = prf.namee;
                    op.profilePhone = prf.phone;
                }

                if(op.docs && op.docs.parkingPic && op.docs.parkingPic.path)
                    op.docs.parkingPic.path = op.docs.parkingPic.path.slice(6);
                
                if(op.docs && op.docs.powerMeterPic && op.docs.powerMeterPic.path)
                    op.docs.powerMeterPic.path = op.docs.powerMeterPic.path.slice(6);
                
                let op_det = await operationDetail
                .find(
                    {
                        operationID: op._id
                    }
                )
                .lean()
                .exec();
        
                await Promise.all(
                    op_det.map(async(det) => {
                        let product = await charger
                        .findOne(
                            {
                                _id: det.productID
                            }
                        )
                        .exec();

                        if(product){
                            det.productName = product.name;
                        }
                    })
                );

                let res__ = await getReturnedOrder(op._id.toString(), op.profileID.toString(), 3);
                if(res__.status === 200){
                    op.details = res__.details;
                }

                detailsConfirmed3[op._id] = op_det;
            })
        );
        
        return res.status(200).send({operationsConfirmed2, operationsConfirmed3})

    }else{
        return res.status(400).json('شما دسترسی انجام عملیات را ندارید');
    }

    
});

router.post('/getAllOrdersExcel', async(req, res) => {

    let token = '';
    let user = '';
    if(req.body.params){
        token = req.body.params.Authorization;
        const decoded = jwt.verify(token, keys.secretOrKey);

            user = await userAdmin.findOne(
            {
                _id: decoded.id,
                role: "store"
            }
        )
        .exec();
    }

    if (user){
        
        let operations = await operation
        .aggregate([
            {
                "$match": {status: {$in: [4, 5, 6, 7]}}
            },
            {
                "$project":{
                    "وضعیت سفارش": "$status",
                    "آدرس": "$address",
                    "کد پیگیری": "$trackingCode",
                    "تاریخ ثبت": "$createDate1",
                    "profileID": "$profileID"
                }
            }
            
        ]);
        
        //let details = {};
        Promise.all(
            operations.map(async(op) => {
            
                let prf = await profileModel
                .aggregate([
                    {
                        "$match": {
                            _id: op.profileID
                        }
                    },
                    {
                        "$project":{
                            "مشتری": "$namee",
                            "همراه مشتری": "$phone",
                            "کد پستی": "$postalCode"
                        }
                    }
                ])
                .exec();
                
                if(prf && prf.length > 0){
                    Object.assign(op, op, prf[0]);
                }

                op['تاریخ ثبت'] = moment(op['تاریخ ثبت']).format('jYYYY/jM/jD, h:mm:ss a');
                switch(op['وضعیت سفارش']){
                    case 4:
                        op['وضعیت سفارش'] = 'درحال آماده‌سازی سفارش';
                        break;
                    case 5:
                        op['وضعیت سفارش'] = 'درحال آمده‌سازی جهت ارسال و نصب';
                        break;
                    case 6:
                        op['وضعیت سفارش'] = 'درحال ارسال و نصب';
                        break;
                    case 7:
                        op['وضعیت سفارش'] = 'ارسال و نصب';
                        break;
                }
                
                delete op._id;
                delete op.profileID;

                // if(op.docs && op.docs.parkingPic)
                //     op.docs.parkingPic.path = op.docs.parkingPic.path.slice(6);
                
                // if(op.docs && op.docs.powerMeterPic)
                //     op.docs.powerMeterPic.path = op.docs.powerMeterPic.path.slice(6);
                
                // let op_det = await operationDetail
                // .find(
                //     {
                //         operationID: op._id
                //     }
                // )
                // .lean()
                // .exec();
        
                // await Promise.all(
                //     op_det.map(async(det) => {
                //         let product = await charger
                //         .findOne(
                //             {
                //                 _id: det.productID
                //             }
                //         )
                //         .exec();

                //         if(product){
                //             det.productName = product.name;
                //         }
                //     })
                // );

                // details[op._id] = op_det;
            })
        )
        .then(() => {
            return res.status(200).json({operations/*, details*/});
        });

    }else{
        return res.status(400).json('شما دسترسی انجام عملیات را ندارید');
    }

    
})

router.post('/getUserOrders', passport.authenticate("jwt", {
    session: false
  }), async(req, res) => {

    if(req.body.containReturned === undefined || [1, 2, 3].includes(parseInt(req.body.containReturned)) === false){
        req.body.containReturned = 1;
    }

    let operations = "";
    if(!req.body.status){

            switch(parseInt(req.body.containReturned)){
                case 1:

                    operations = await operation
                    .find(
                        {
                            profileID: req.user._id,
                            status: {$ne: 0}
                        }
                    )
                    .sort({createDate1: -1})
                    .lean()
                    .exec();

                    break;
                case 2:

                    operations = await operation
                    .find(
                        {
                            profileID: req.user._id,
                            status: {$ne: 0},
                            $or:[
                                {hasReturned : {$exists: false}},
                                {hasReturned: false}
                            ]
                        }
                    )
                    .sort({createDate1: -1})
                    .lean()
                    .exec();

                    break;
                case 3:

                    operations = await operation
                    .find(
                        {
                            profileID: req.user._id,
                            status: {$ne: 0},
                            hasReturned: true
                        }
                    )
                    .sort({createDate1: -1})
                    .lean()
                    .exec();

                    break;
                default:
                    
                    operations = await operation
                    .find(
                        {
                            profileID: req.user._id,
                            status: {$ne: 0}
                        }
                    )
                    .sort({createDate1: -1})
                    .lean()
                    .exec();

                    break;
            }

    }else{

            switch(parseInt(req.body.containReturned)){
                case 1:

                    operations = await operation
                    .find(
                        {
                            profileID: req.user._id,
                            status: req.body.status
                        }
                    )
                    .sort({createDate1: -1})
                    .lean()
                    .exec();

                    break;
                case 2:

                    operations = await operation
                    .find(
                        {
                            profileID: req.user._id,
                            status: req.body.status,
                            $or:[
                                {hasReturned : {$exists: false}},
                                {hasReturned: false}
                            ]
                        }
                    )
                    .sort({createDate1: -1})
                    .lean()
                    .exec();

                    break;
                case 3:

                    operations = await operation
                    .find(
                        {
                            profileID: req.user._id,
                            status: req.body.status,
                            hasReturned: true
                        }
                    )
                    .sort({createDate1: -1})
                    .lean()
                    .exec();

                    break;
                default:
                    
                    operations = await operation
                    .find(
                        {
                            profileID: req.user._id,
                            status: req.body.status
                        }
                    )
                    .sort({createDate1: -1})
                    .lean()
                    .exec();

                    break;
            }
    }
    
    let details = {};
    let page=req.body.page;
    let limit=req.body.limit;
    let starteIndex=(page-1)*limit;
    let endIndex=page*limit;
    let len=operations.length;
   
    if(page==0) {
        Promise.all(
            operations.map(async(op) => {
            
                let prf = await profileModel
                .findOne({
                    _id: op.profileID
                })
                .exec();

                if(prf){
                    op.profileName = prf.namee;
                    op.profilePhone = prf.phone;
                }

                if(op.docs && op.docs.parkingPic && op.docs.parkingPic.path)
                    op.docs.parkingPic.path = op.docs.parkingPic.path.slice(6);
                
                if(op.docs && op.docs.powerMeterPic && op.docs.powerMeterPic.path)
                    op.docs.powerMeterPic.path = op.docs.powerMeterPic.path.slice(6);
                
                let op_det = [];
                if(req.body.containReturned === 3){

                    op_det = await operationDetail
                    .find(
                        {
                            operationID: op._id,
                            'returnedInfo.isReturned': true,
                            'returnedInfo.confirmed': 3
                        }
                    )
                    .lean()
                    .exec();

                }else{

                    op_det = await operationDetail
                    .find(
                        {
                            operationID: op._id
                        }
                    )
                    .lean()
                    .exec();
                }
        
                await Promise.all(
                    op_det.map(async(det) => {
                        let product = await charger
                        .findOne(
                            {
                                _id: det.productID
                            }
                        )
                        .exec();

                        if(product){
                            det.productName = product.name;
                        }
                    })
                );

                if(req.body.containReturned === 3){
                    let res__ = await getReturnedOrder(op._id.toString(), op.profileID.toString(), 3);
                    if(res__.status === 200){
                        op.details = res__.details;
                    }
                    
                }else{
                    let res__ = await getOrder(op._id.toString(), op.profileID.toString());
                    if(res__.status === 200){
                        op.details = res__.details;
                    }
                }
                
                details[op._id] = op_det;
            })
        )
        .then(() => {
            return res.status(200).json({operations, details,len});
        });
    }
    else {
        if(operations){
            const result = operations.slice(starteIndex,endIndex);
            if(result) {
                Promise.all(
                    result.map(async(op) => {
                    
                        let prf = await profileModel
                        .findOne({
                            _id: op.profileID
                        })
                        .exec();

                        if(prf){
                            op.profileName = prf.namee;
                            op.profilePhone = prf.phone;
                        }

                        if(op.docs && op.docs.parkingPic && op.docs.parkingPic.path)
                            op.docs.parkingPic.path = op.docs.parkingPic.path.slice(6);
                        
                        if(op.docs && op.docs.powerMeterPic && op.docs.powerMeterPic.path)
                            op.docs.powerMeterPic.path = op.docs.powerMeterPic.path.slice(6);
                        
                            let op_det = [];
                            if(req.body.containReturned === 3){
            
                                op_det = await operationDetail
                                .find(
                                    {
                                        operationID: op._id,
                                        'returnedInfo.isReturned': true,
                                        'returnedInfo.confirmed': 3
                                    }
                                )
                                .lean()
                                .exec();
            
                            }else{
            
                                op_det = await operationDetail
                                .find(
                                    {
                                        operationID: op._id
                                    }
                                )
                                .lean()
                                .exec();
                            }
                    
                            await Promise.all(
                            op_det.map(async(det) => {
                                let product = await charger
                                .findOne(
                                    {
                                        _id: det.productID
                                    }
                                )
                                .exec();

                                if(product){
                                    det.productName = product.name;
                                }
                            })
                        );

                        if(req.body.containReturned === 3){
                            let res__ = await getReturnedOrder(op._id.toString(), op.profileID.toString(), 3);
                            if(res__.status === 200){
                                op.details = res__.details;
                            }
                            
                        }else{
                            let res__ = await getOrder(op._id.toString(), op.profileID.toString());
                            if(res__.status === 200){
                                op.details = res__.details;
                            }
                        }
                        
                        details[op._id] = op_det;
                    })
                )
                .then(() => {
                    return res.status(200).json({result, details,len});
                });
            }else {
                return res.status(400).send("سوابق خريد يافت نشد");
            }
        }else{
            return res.status(200).json({result: [], details: [], len:0});
        }
    }
});

//confirmed 2 or 3 or both === 0
getAllReturnedByConfirmed = (sort, status) => new Promise(async (resolve, reject) => {

    let details2 = [];
    let details3 = [];
    let operations2 = [];
    let operations3 = [];

    details2 = await operationDetail
        .find(
            {
                'returnedInfo.isReturned': true,
                'returnedInfo.confirmed' : {$in: [2]}
            }
        )
        .lean()
        .exec();

    details3 = await operationDetail
        .find(
            {
                'returnedInfo.isReturned': true,
                'returnedInfo.confirmed' : {$in: [3]}
            }
        )
        .lean()
        .exec();

    let ops = new Set();
    if(details2 !== undefined && details2.length > 0){

        await Promise.all(details2.map(det => {
            if(det.operationID !== undefined){
                ops.add(det.operationID);
            }
        }));

        let operationIDs = Array.from(ops);

        if(operationIDs !== undefined && operationIDs !== null && operationIDs.length > 0){

            
            if(status !== undefined && status !== null){
                operations2 = await operation
                .find(
                    {
                        _id: {$in: operationIDs},
                        status: status
                    }
                )
                .sort({createDate1: sort})
                .lean()
                .exec();
            }else{
                operations2 = await operation
                .find(
                    {
                        _id: {$in: operationIDs}
                    }
                )
                .sort({createDate1: sort})
                .lean()
                .exec();
            }
        }
    }

    if(details3 !== undefined && details3.length > 0){

        await Promise.all(details3.map(det => {
            if(det.operationID !== undefined){
                ops.add(det.operationID);
            }
        }));

        let operationIDs = Array.from(ops);

        if(operationIDs !== undefined && operationIDs !== null && operationIDs.length > 0){

            if(status !== undefined && status !== null){
                operations3 = await operation
                .find(
                    {
                        _id: {$in: operationIDs},
                        status: status
                    }
                )
                .sort({createDate1: sort})
                .lean()
                .exec();
            }else{
                operations3 = await operation
                .find(
                    {
                        _id: {$in: operationIDs}
                    }
                )
                .sort({createDate1: sort})
                .lean()
                .exec();
            }
        }
    }

    resolve({operations2, operations3});
});

getAllReturnedIDsByConfirmed = (confirmed, status) => new Promise(async (resolve, reject) => {

    let details = [];
    if(confirmed === 0){

        details = await operationDetail
        .find(
            {
                'returnedInfo.isReturned': true,
                'returnedInfo.confirmed' : {$in: [2, 3]}
            }
        )
        .lean()
        .exec();
        
    }else{

        details = await operationDetail
        .find(
            {
                'returnedInfo.isReturned': true,
                'returnedInfo.confirmed' : confirmed
            }
        )
        .lean()
        .exec();
    }

    let ops = new Set();
    if(details !== undefined && details.length > 0){

        await Promise.all(details.map(det => {
            if(det.operationID !== undefined){
                ops.add(det.operationID);
            }
        }));

        let operationIDs = Array.from(ops);

        if(operationIDs !== undefined && operationIDs !== null && operationIDs.length > 0){

            resolve(operationIDs);

        }else{
            return resolve([]);
        }
    }else{
        return resolve([]);
    }
});

getOrder = (operation_id, profileID, hide) => new Promise(async (resolve, reject) => {

    let uero = await lastEuro
            .find()
            .exec();

    let EuroVal = uero[0].lastValue;
    if(keys.EuroVal && parseInt(keys.EuroVal) > 0)
    {
        EuroVal = keys.EuroVal;
    }
    let op = '';
    if(operation_id && operation_id!= ''){

        op = await operation
        .findOne(
            {
                _id: operation_id
            }
        )
        .lean()
        .exec();

    }else{

        op = await operation
        .findOne(
            {
                status: 0,
                profileID: profileID
            }
        )
        .lean()
        .exec();

    }
    if(op){

            let prf = await profileModel
            .findOne({
                _id: op.profileID
            })
            .exec();

            if(prf){
                op.profileName = prf.namee;
                op.profilePhone = prf.phone;
                if(!op.address || (op.address && op.address.length <= 0))
                    op.address = prf.address;
                if(!op.postalCode || (op.postalCode && op.postalCode.length <= 0))
                    op.profilepostalCode = prf.postalCode;
                else
                    op.profilepostalCode = op.postalCode;
                op.profilenationalcode = prf.nationalcode;
            }

            if(op.docs && op.docs.parkingPic && op.docs.parkingPic.path)
                op.docs.parkingPic.path = op.docs.parkingPic.path.slice(6);
            
            if(op.docs && op.docs.powerMeterPic && op.docs.powerMeterPic.path)
                op.docs.powerMeterPic.path = op.docs.powerMeterPic.path.slice(6);
            
            let details = '';
            if(hide === undefined || hide === false){

                details = await operationDetail
                .find(
                    {
                        operationID: op._id
                    }
                )
                .lean()
                .exec();

            }else if(hide !== undefined && hide === true){

                details = await operationDetail
                .find(
                    {
                        operationID: op._id,
                        'returnedInfo.isReturned': true
                    }
                )
                .lean()
                .exec();

            }
            

            await Promise.all(
                details.map(async(det) => {
                    let product = await charger
                    .findOne(
                        {
                            _id: det.productID
                        }
                    )
                    .exec();

                    if(product){
                        det.productName = product.name;
                        for(var k=0; k < product.image.length; k++) {

                            //remove public from path
                            product.image[k].data = product.image[k].data.slice(6);
                        }
                        
                        det.image = product.image;
                        if(op.status < 3 || (op.status === 3 && op.paid === false))
                        {

                            if(det.options !== undefined){

                                let attrs = [];
                                for(var k=0; k < det.options.length; k++) {
                
                                    attrs.push({
                                        value: det.options[k].valueName ? det.options[k].valueName : ''
                                    });
                
                                }
                
                                if(attrs.length > 0){
                
                                    let product__ = await chargersLookup
                                    .findOne({
                                        product_id: det.productID
                                    })
                                    .exec();
                
                                    let inputAttrs = [];
                
                                    await Promise.all(attrs.map(attr => {
                                        inputAttrs.push(attr.value);
                                    }));
                
                                    if(product__){
                
                                        let price = 0;
                                        let exists = false;
                
                                        await Promise.all(product__.models.map(mdl => {
                                            if(arraysEqual(inputAttrs, mdl.attrs) === true){
                                                price = mdl.price;
                                                exists = true;
                                            }
                                        }));
                
                                        if(exists === true){
                
                                            if(product.profit === 0){
                                                product.profit = 1;
                                            }
                                                
                                            det.price = Math.round((parseFloat(price) * parseFloat(product.profit) * parseInt(EuroVal))/1000)*1000;
                                            det.afterdiscount = parseInt(det.price) - (parseInt(det.price) * (product.discount / 100) * parseFloat(product.profit));
                
                                        }
                
                                    }
                                }
                            }

                            //det.price = Math.round((parseFloat(product.price) * parseFloat(product.profit) * parseInt(EuroVal))/1000)*1000;
                            det.discount = product.discount;
                            //det.afterdiscount = Math.round((parseFloat(product.afterdiscount) * parseFloat(product.profit) * parseInt(EuroVal))/1000)*1000;

			                if(product.deliveryPrice !== undefined)
                                det.deliveryPrice = product.deliveryPrice;

                            if(product.InstallationPrice !== undefined)
                                det.InstallationPrice = product.InstallationPrice;
                        }

                        for(var k=0; k < product.attributes.length; k++) {

                            product.attributes[k].values.map(pr_attr => {
                                //pr_attr.price = Math.round((parseFloat(pr_attr.price) * parseFloat(product.profit) * parseInt(EuroVal))/1000)*1000;
                                if(det.options !== undefined){

                                    let opt_ = det.options.find(opt => opt.attrID === product.attributes[k]._id.toString() && opt.valueID === pr_attr._id.toString())
                                pr_attr.price = Math.round((parseFloat(pr_attr.price) * parseFloat(product.profit) * parseInt(EuroVal))/1000)*1000;
                                    if(opt_ !== undefined && (op.status < 3 || (op.status === 3 && op.paid === false)))
                                        opt_.price = pr_attr.price;
                                }
                            });

                        }

                        if(det.options !== undefined){
                            det.options.sort((opt1, opt2) => (opt1.valueID > opt2.valueID) ? 1 : (opt1.valueID < opt2.valueID) ? -1 : 0);
                        }
                        det.attributes = product.attributes;

                        if(product.product_model !== undefined){
                            det.product_model = product.product_model;
                        }
                    }
                })
            );
            
            return resolve( 
                {
                    status: 200,
                    op,
                    details
                }
            );
            
    }else{
        return reject (
            {
                status: 400,
                err: 'سفارشی با این مشخصات یافت نشد'
            }
        )
    }
});

//only returned confirmed 3, 2 details of an operation
getReturnedOrder = (operation_id, profileID, confirmed) => new Promise(async (resolve, reject) => {

    let uero = await lastEuro
            .find()
            .exec();

    let EuroVal = uero[0].lastValue;
    if(keys.EuroVal && parseInt(keys.EuroVal) > 0)
    {
        EuroVal = keys.EuroVal;
    }
    let op = '';
    if(operation_id && operation_id!= ''){

        op = await operation
        .findOne(
            {
                _id: operation_id
            }
        )
        .lean()
        .exec();

    }else{

        op = await operation
        .findOne(
            {
                status: 0,
                profileID: profileID
            }
        )
        .lean()
        .exec();

    }
    if(op){

            let prf = await profileModel
            .findOne({
                _id: op.profileID
            })
            .exec();

            if(prf){
                op.profileName = prf.namee;
                op.profilePhone = prf.phone;
                if(!op.address || (op.address && op.address.length <= 0))
                    op.address = prf.address;
                if(!op.postalCode || (op.postalCode && op.postalCode.length <= 0))
                    op.profilepostalCode = prf.postalCode;
                else
                    op.profilepostalCode = op.postalCode;
                op.profilenationalcode = prf.nationalcode;
            }

            if(op.docs && op.docs.parkingPic && op.docs.parkingPic.path)
                op.docs.parkingPic.path = op.docs.parkingPic.path.slice(6);
            
            if(op.docs && op.docs.powerMeterPic && op.docs.powerMeterPic.path)
                op.docs.powerMeterPic.path = op.docs.powerMeterPic.path.slice(6);
            
            let details = '';
            if(confirmed !== undefined && (confirmed === 3 || confirmed === 2)){

                details = await operationDetail
                .find(
                    {
                        operationID: op._id,
                        'returnedInfo.isReturned': true,
                        'returnedInfo.confirmed': confirmed
                    }
                )
                .lean()
                .exec();

            }else{

                details = await operationDetail
                .find(
                    {
                        operationID: op._id,
                        'returnedInfo.isReturned': true,
                        $or:[
                            {'returnedInfo.confirmed': 2},
                            {'returnedInfo.confirmed': 3}
                        ]
                        
                    }
                )
                .lean()
                .exec();

            }
            

            await Promise.all(
                details.map(async(det) => {
                    let product = await charger
                    .findOne(
                        {
                            _id: det.productID
                        }
                    )
                    .exec();

                    if(product){
                        det.productName = product.name;
                        for(var k=0; k < product.image.length; k++) {

                            //remove public from path
                            product.image[k].data = product.image[k].data.slice(6);
                        }
                        
                        det.image = product.image;
                        if(op.status < 3 || (op.status === 3 && op.paid === false))
                        {
                            det.price = Math.round((parseFloat(product.price) * parseFloat(product.profit) * parseInt(EuroVal))/1000)*1000;
                            det.discount = product.discount;
                            det.afterdiscount = Math.round((parseFloat(product.afterdiscount) * parseFloat(product.profit) * parseInt(EuroVal))/1000)*1000;
                        }

                        for(var k=0; k < product.attributes.length; k++) {

                            product.attributes[k].values.map(pr_attr => {
                                //pr_attr.price = Math.round((parseFloat(pr_attr.price) * parseFloat(product.profit) * parseInt(EuroVal))/1000)*1000;
                                if(det.options !== undefined){

                                    let opt_ = det.options.find(opt => opt.attrID === product.attributes[k]._id.toString() && opt.valueID === pr_attr._id.toString())
                                pr_attr.price = Math.round((parseFloat(pr_attr.price) * parseFloat(product.profit) * parseInt(EuroVal))/1000)*1000;
                                    if(opt_ !== undefined && (op.status < 3 || (op.status === 3 && op.paid === false)))
                                        opt_.price = pr_attr.price;
                                }
                            });

                        }

                        if(det.options !== undefined){
                            det.options.sort((opt1, opt2) => (opt1.valueID > opt2.valueID) ? 1 : (opt1.valueID < opt2.valueID) ? -1 : 0);
                        }
                        det.attributes = product.attributes;

                        if(product.product_model !== undefined){
                            det.product_model = product.product_model;
                        }
                    }
                })
            );
            
            return resolve( 
                {
                    status: 200,
                    op,
                    details
                }
            );
            
    }else{
        return reject (
            {
                status: 400,
                err: 'سفارشی با این مشخصات یافت نشد'
            }
        )
    }
});

router.post('/getOrder', passport.authenticate("jwt", {
    session: false
  }), async (req, res) =>{

    // let resAPI = await axios.get('http://api.navasan.tech/latest/?api_key=vYLyHkr2yCP7pdJH0qv9I7Rhoxo1vc8r&item=eur')
    // console.log(resAPI, resAPI.data.eur.value);

    let uero = await lastEuro
            .find()
            .exec();

    let EuroVal = uero[0].lastValue;
    if(keys.EuroVal && parseInt(keys.EuroVal) > 0)
    {
        EuroVal = keys.EuroVal;
    }
    let op = '';
    if(req.body.operation_id && req.body.operation_id!= ''){

        op = await operation
            .findOne(
                {
                    _id: req.body.operation_id
                }
            )
            .lean()
            .exec();

    }else{

        op = await operation
            .findOne(
                {
                    status: 0,
                    profileID: req.user._id
                }
            )
            .lean()
            .exec();

    }
        if(op){

            let prf = await profileModel
            .findOne({
                _id: op.profileID
            })
            .exec();

            if(prf){
                op.profileName = prf.namee;
                op.profilePhone = prf.phone;
                if(!op.address || (op.address && op.address.length <= 0))
                    op.address = prf.address;
                if(!op.postalCode || (op.postalCode && op.postalCode.length <= 0))
                    op.profilepostalCode = prf.postalCode;
                else
                    op.profilepostalCode = op.postalCode;
                op.profilenationalcode = prf.nationalcode;
            }

            if(op.docs && op.docs.parkingPic && op.docs.parkingPic.path)
                op.docs.parkingPic.path = op.docs.parkingPic.path.slice(6);
            
            if(op.docs && op.docs.powerMeterPic && op.docs.powerMeterPic.path)
                op.docs.powerMeterPic.path = op.docs.powerMeterPic.path.slice(6);
            
                //1 means return all containing returnes and non-returned
                //2 means just non-returned
                //3 means just returned
            if(req.body.containReturned === undefined || [1, 2, 3].includes(parseInt(req.body.containReturned)) === false){
                req.body.containReturned = 1;
            }

            let details = [];
            switch(parseInt(req.body.containReturned)){
                case 1:
                    details = await operationDetail
                    .find(
                        {
                            operationID: op._id
                        }
                    )
                    .lean()
                    .exec();
                    break;
                case 2:
                    details = await operationDetail
                    .find(
                        {
                            operationID: op._id,
                            $or: [
                                {returnedInfo: {$exists: false}},
                                {'returnedInfo.isReturned': {$exists: false}},
                                {'returnedInfo.isReturned': false}
                            ]
                        }
                    )
                    .lean()
                    .exec();
                    break;
                case 3:
                    details = await operationDetail
                    .find(
                        {
                            operationID: op._id,
                            $and:[
                                {returnedInfo: {$exists: true}},
                                {'returnedInfo.isReturned': true}
                            ]
                        }
                    )
                    .lean()
                    .exec();
                    break;
                default:
                    details = await operationDetail
                    .find(
                        {
                            operationID: op._id
                        }
                    )
                    .lean()
                    .exec();
                    break;
            }
            

            if(keys.EuroChanged === true){
                keys.resetEuroChanged(false);
            }

            await Promise.all(
                details.map(async(det) => {
                    let product = await charger
                    .findOne(
                        {
                            _id: det.productID
                        }
                    )
                    .exec();

                    if(product){
                        det.productName = product.name;
                        for(var k=0; k < product.image.length; k++) {

                            //remove public from path
                            product.image[k].data = product.image[k].data.slice(6);
                        }
                        
                        det.image = product.image;
                        if(op.status < 3 || (op.status === 3 && (op.paid === false || op.paid === undefined)))
                        {
                            if(product.price !== undefined && product.profit !== undefined){
                                det.price = Math.round((parseFloat(product.price) * parseFloat(product.profit) * parseInt(EuroVal))/1000)*1000;
                            }else{
                                det.price = 0;
                            }

                            if(det.options !== undefined){

                                let attrs = [];
                                for(var k=0; k < det.options.length; k++) {
                
                                    attrs.push({
                                        value: det.options[k].valueName ? det.options[k].valueName : ''
                                    });
                
                                }
                
                                if(attrs.length > 0){
                
                                    let product__ = await chargersLookup
                                    .findOne({
                                        product_id: det.productID
                                    })
                                    .exec();
                
                                    let inputAttrs = [];
                
                                    await Promise.all(attrs.map(attr => {
                                        inputAttrs.push(attr.value);
                                    }));
                
                                    if(product__){
                
                                        let price = 0;
                                        let exists = false;
                
                                        await Promise.all(product__.models.map(mdl => {
                                            if(arraysEqual(inputAttrs, mdl.attrs) === true){
                                                price = mdl.price;
                                                exists = true;
                                            }
                                        }));
                
                                        if(exists === true){
                
                                            if(product.profit === 0){
                                                product.profit = 1;
                                            }
                                                
                                            det.price = Math.round((parseFloat(price) * parseFloat(product.profit) * parseInt(EuroVal))/1000)*1000;
                                            det.afterdiscount = parseInt(det.price) - (parseInt(det.price) * (product.discount / 100) * parseFloat(product.profit));
                
                                        }
                
                                    }
                                }
                            }

                            det.discount = product.discount;

                            // if(product.afterdiscount !== undefined && product.profit !== undefined){
                            //     det.afterdiscount = Math.round((parseFloat(det.afterdiscount) * parseFloat(product.profit) /** parseInt(EuroVal)*/)/1000)*1000;
                            // }else{
                            //     det.afterdiscount = 0;
                            // }

                            if(product.deliveryPrice !== undefined)
                                det.deliveryPrice = product.deliveryPrice;

                            if(product.InstallationPrice !== undefined)
                                det.InstallationPrice = product.InstallationPrice;
                        }

                        for(var k=0; k < product.attributes.length; k++) {

                            product.attributes[k].values.map(pr_attr => {
                                
                                if(det.options !== undefined){

                                    let opt_ = det.options.find(opt => opt.attrID === product.attributes[k]._id.toString() && opt.valueID === pr_attr._id.toString())
                                    
                                    if(pr_attr.price !== undefined && product.profit !== undefined){
                                        pr_attr.price = Math.round((parseFloat(pr_attr.price) * parseFloat(product.profit) * parseInt(EuroVal))/1000)*1000;
                                    }else{
                                        pr_attr.price = 0;
                                    }

                                    if(opt_ !== undefined && (op.status < 3 || (op.status === 3 && (op.paid === false || op.paid === undefined))))
                                        opt_.price = pr_attr.price;
                                }

                            });

                        }

                        if(det.options !== undefined){
                            det.options.sort((opt1, opt2) => (opt1.valueID > opt2.valueID) ? 1 : (opt1.valueID < opt2.valueID) ? -1 : 0);
                        }
                        det.attributes = product.attributes;

                        if(product.product_model !== undefined){
                            det.product_model = product.product_model;
                        }
                        
                    }
                })
            );
            
            if(op.status === 7 && op.deliveredDate7 !== undefined){
                let days = 7;
                op.validReturnedDate = new Date(op.deliveredDate7);
                op.validReturnedDate.setDate(op.deliveredDate7.getDate() + parseInt(days));
                op.currentDate = new Date();
            }
            return res.status(200).send({operation: op, details, EuroChanged: keys.EuroChanged});
        }else{
            return res.status(400).json('سفارشی با این مشخصات یافت نشد');
        }
});

router.post('/basicReturn', passport.authenticate("jwt", {
    session: false
  }), async (req, res) => {

    const op = await operation
    .findOne(
        {
            _id: req.body.operation_id,
            profileID: req.user._id
        }
    )
    .lean()
    .exec();

    if(op){

        if(op.status !== 7){
            return res.status(400).json('خطا! سفارش‌هایی امکان مرجوعی دارند که به مرحله نصب رسیده باشند');
        }else{

            const result = await Promise.all(
       
                req.body.returned.map(async(prReturned) => {
                    
                    if(prReturned.id === undefined || prReturned.id === ""){
        
                            return {
                                status: 400,
                                error: 'خطا در پارامتر ورودی شناسه سطر سفارش'
                            }
        
                    }else{
                
                        const detail = await operationDetail
                            .findOne(
                                {
                                    operationID: op._id,
                                    _id: prReturned.id
                                }
                            )
                            .lean()
                            .exec();
                    
                            if(detail){
                        
                                    if(prReturned.isReturned !== undefined && prReturned.isReturned === false){

                                        await operationDetail
                                        .findOneAndUpdate(
                                            {
                                                _id: detail._id
                                            },
                                            {
                                                $unset: {returnedInfo: ""}
                                            }
                                        )
                                        .exec();

                                    }else if(prReturned.isReturned !== undefined && prReturned.isReturned === true){

                                        let returnedInfo = {
                                            isReturned: true,
                                            confirmed: 1,
                                        }
                            
                                        await operationDetail
                                        .findOneAndUpdate(
                                            {
                                                _id: detail._id
                                            },
                                            {
                                                $set:{returnedInfo: returnedInfo}
                                            }
                                        )
                                        .exec();
                                    }
                            }
                        }
                })
            );
    
            let dets = [];
            dets = await operationDetail
            .find(
                {
                    operationID: op._id,
                    'returnedInfo.isReturned': true
                }
            )
            .lean()
            .exec();

            if((dets && dets.length <= 0) || dets === undefined){
                await operstion
                .findOneAndUpdate(
                    {
                        _id: op._id
                    },
                    {
                        $unset: {hasReturned: ""}
                    }
                )
                .exec();
            }

            if(result && result.length > 0 && result[0] !== undefined && result[0].status === 400){
                return res.status(400).json(result[0].error);
            }else{

                const prf = await profileModel
                .findOne(
                    {
                        _id: op.profileID
                    }
                )
                .lean()
                .exec();
                
                let res__ = await getOrder(op._id.toString(), prf._id,true);
                if(res__.status === 200){
                    return res.status(200).send({operation: res__.op, operationDetail: res__.details});
                } else{
                    return res.status(400).json('سفارشی با این مشخصات یافت نشد');
                }
                //return res.status(200).json('درخواست مرجوعی با موفقیت ثبت شد.');
            }
        }
        
    }else{
        return res.status(400).json('سفارشی با این مشخصات یافت نشد');
    }

});

router.post('/return', passport.authenticate("jwt", {
    session: false
  }), async (req, res) => {
    
    const op = await operation
    .findOne(
        {
            _id: req.body.operation_id,
            profileID: req.user._id
        }
    )
    .lean()
    .exec();

    if(op){

        if(op.status !== 7){
            return res.status(400).json('خطا! سفارش‌هایی امکان مرجوعی دارند که به مرحله نصب رسیده باشند');
        }else{
            const result = await Promise.all(
       
                req.body.returned.map(async(prReturned) => {
                    
                    if(prReturned.id === undefined || prReturned.id === ""
                        || prReturned.quantity === undefined || prReturned.quantity === "" || parseInt(prReturned.quantity) <= 0
                        || req.body.operation_id === undefined || req.body.operation_id === ""
                        || prReturned.reason === undefined || prReturned.reason === "" ||
                        (prReturned.forcedescription !== undefined && prReturned.forcedescription === true && (prReturned.description === undefined || prReturned.description === ''))){
        
                            return {
                                status: 400,
                                error: 'خطا در پارامترهای ورودی'
                            }
        
                        }else{
                
                            const detail = await operationDetail
                            .findOne(
                                {
                                    operationID: op._id,
                                    _id: prReturned.id
                                }
                            )
                            .lean()
                            .exec();
                    
                            if(detail){
        
                                if(detail.quantity < prReturned.quantity){

                                    return {
                                        status: 400,
                                        error: 'خطا در تعداد مورد درخواست مرجوعی'
                                    }

                                }else{
                        
                                    if(prReturned.forcedescription === undefined || (prReturned.forcedescription !== undefined && prReturned.forcedescription === false)){
                                        prReturned.description = '';
                                    }

                                    await operationDetail
                                    .findOneAndUpdate(
                                        {
                                            _id: detail._id
                                        },
                                        {
                                            $set:{
                                                'returnedInfo.numReturned': prReturned.quantity,
                                                'returnedInfo.dateReturned': Date.now(),
                                                'returnedInfo.reason': prReturned.reason,
                                                'returnedInfo.confirmed': 2,
                                                'returnedInfo.description': prReturned.description
                                            }
                                        }
                                    )
                                    .exec();

                                    await operation
                                    .findOneAndUpdate(
                                        {
                                            _id: op._id
                                        },
                                        {
                                            //hasReturned: true
                                            dateReturned: Date.now()
                                        }
                                    )
                                    .exec();
            
                                    const prf = await profileModel
                                    .findOne(
                                        {
                                            _id: op.profileID
                                        }
                                    )
                                    .lean()
                                    .exec();
                        
                                    //send message to operator
                                    sendsms("09143551361", op.trackingCode.toString(),"5luyva0eto");
                        
                                    if(prf){
                                        //send message to user
                                        sendsms(prf.phone, op.trackingCode.toString(),"xgcpzfi92m");
                                    }
                                }
                            }
                        }
                })
            );
    
            console.log(result);
            if(result && result.length > 0 && result[0] !== undefined && result[0].status === 400){
                return res.status(400).json(result[0].error);
            }else{
                return res.status(200).json('درخواست مرجوعی با موفقیت ثبت شد');
            }
        }

    }else{
        return res.status(400).json('سفارشی با این مشخصات یافت نشد');
    }
    
    
    
});

router.get('/returnReasons', async (req, res) => {

    let reasons = [];
    reasons.push('عدم تطابق سلامت فیزیکی کالا در هنگام تحویل');
    reasons.push('عدم تطابق کیفیت کالای تحویلی با ادعای فروشنده');
    reasons.push('نامناسب بودن کالا با مشخصات محل مشتری');
    reasons.push('انصراف مشتری از خرید');
    reasons.push('سایر');

    res.status(200).json(reasons);
});
module.exports = router;