const fileUploadModel = require('../../models/fileUpload');
let isEmpty = require('../../validation/is-empty');
let validateCMSUploadInput = require('../../validation/cms');
const userAdminModel = require('../../models/userAdmin');
const RefTok = require('../../models/RefTokcms');

//Multer is a node.js middleware which is primarily used for uploading files.
const multer = require('multer'); 
const express = require('express');
const jwt = require("jsonwebtoken");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const randtoken = require('rand-token');
const keys = require("../../config/keys");
// const fs = require('fs');

// const db = require('../../config/keys').mongoURI;// DB Config

const router = express.Router();

var moment = require('moment-jalaali');
moment.loadPersian();
// @route   GET api/cms/insert
// @desc    Register admin information in the database
router.post('/insertAdmin',async (req,res)=>{
    try{
        console.log('insertAdmin');

        if(req.body.email!=undefined){
            const info = {};
            info.name = req.body.name;
            info.phone = req.body.phone;
            info.email = req.body.email; 
            info.password = req.body.password;
            info.role = req.body.role;
              
            userAdminModel.findOne({
                email: req.body.email
            })
            .then(useradmin => {
            if (useradmin) {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(info.password, salt, (err, hash) => {
                        if (err) throw err;
                        info.password = hash;
                        userAdminModel.findOneAndUpdate({
                            email: req.body.email
                        }, {
                            $set: info
                        }, {
                            new: true
                        })
                        .then(() => {
                            res.status(200).json({result: "اطلاعات با موفقیت ذخیره شد", resultEN: 'Data saved successfully'});
                        })
                        .catch(err => res.status(404).json(err));
                    });
                });
            }
            else
            {
                const useradmin =  new userAdminModel({
                    name: req.body.name, 
                    phone: req.body.phone, 
                    email: req.body.email, 
                    password: info.password, 
                    role: req.body.role
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(useradmin.password, salt, (err, hash) => {
                      if (err) throw err;
                      useradmin.password = hash;
                      useradmin
                        .save()
                        .then(() =>  res.status(200).json({result: "اطلاعات با موفقیت ذخیره شد", resultEN: 'Data saved successfully'}))
                        .catch(err => res.status(400).json(err));
                    });
                });
            }
            })
            .catch(err => res.status(404).json(err));
        }
        else if(req.body.username!=undefined){
            
            const info = {};
            info.name = req.body.name;
            info.phone = req.body.phone;
            info.username = req.body.username; 
            info.password = req.body.password;
            info.role = req.body.role;

            userAdminModel.findOne({
                username: req.body.username
            })
            .then(useradmin => {
            if (useradmin) {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(info.password, salt, (err, hash) => {
                        if (err) throw err;
                        info.password = hash;
                        userAdminModel.findOneAndUpdate({
                            username: req.body.username
                        }, {
                            $set: info
                        }, {
                            new: true
                        })
                        .then(() => {
                            res.status(200).json({result: "اطلاعات با موفقیت ذخیره شد", resultEN: 'Data saved successfully'});
                        })
                        .catch(err => res.status(404).json(err));
                    });
                });
            }
            else
            {
                const useradmin =  new userAdminModel({
                    name: req.body.name, 
                    phone: req.body.phone, 
                    username: req.body.username, 
                    password: req.body.password, 
                    role: req.body.role
                });
            
                  bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(useradmin.password, salt, (err, hash) => {
                      if (err) throw err;
                      useradmin.password = hash;
                      useradmin
                        .save()
                        .then(() =>  res.status(200).json({result: "اطلاعات با موفقیت ذخیره شد", resultEN: 'Data saved successfully'}))
                        .catch(err => res.status(400).json(err));
                    });
                  });
                }
            })
            .catch(err => res.status(404).json(err));
        }
    }
    catch(err){
        res.status(400).send(err.message);
    }
})
// @route   GET api/cms/login
// @desc    Login admin / Returning JWT Token
// @access  Public
router.post("/login", (req, res) => {
    let errors = {};
    if (isEmpty(req.body.password)) {
        errors.password = "وارد کردن رمز ورود الزامی است";
        errors.passwordEN = "Please enter your password";
        return res.status(400).json(errors);
    }
    else if (isEmpty(req.body.email)) {
        errors.email = "وارد کردن ایمیل الزامی است";
        errors.emailEN = "Please enter your email";
        return res.status(400).json(errors);
    }
    else {
        var reg=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email);
        if(!reg)
        {
            errors.email = "آدرس ایمیل نامعتبر است";
            errors.emailEN = "Invalid email address";
            return res.status(400).json(errors);
        }
    }

    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    userAdminModel.findOne({
        email: email
    })
    .then(user => {
        // Check for user
        if (!user) {
            errors.email = "ادمینی با این مشخصات وجود ندارد";
            errors.emailEN = "Admin not found";
        return res.status(404).json(errors);
        }
        // Check Password
        bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
            // User Matched
            // const payload = { id: user.id, email: user.email }; // Create JWT Payload
            const payload = {
            id: user.id,
            email: user.email
            }; // Create JWT Payload

            let refreshToken = randtoken.uid(256)
            //refreshTokens[refreshToken] = user.name;
            const newRefreshToken = new RefTok({
            refreshToken: refreshToken,
            user: user.id,
            email: user.email
            });
            newRefreshToken
            .save()
            .then()
            .catch(err => console.log(err));

            // Sign Token
            jwt.sign(
            payload,
            keys.secretOrKey, {
                expiresIn: 3600 * 336
            },
            (err, token) => {
                res.json({
                success: true,
                token: "Bearer " + token,
                refreshToken: refreshToken,
                email: user.email
                });
            }
            );
        } else {
            errors.password = "رمز ورود اشتباه است";
            errors.passwordEN = "Incorrect password";
            return res.status(400).json(errors);
        }
        });
    })
    .catch(err => res.send(err));
});
/**
 * cb is multer's callback. The first argument is the error 
 * and the next argument specifies if everything went ok(true) or not(false).
 */
// var upload = multer({
//     dest: 'public/images/', fileFilter: (req, file, cb) => {
//         if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
//             cb(null, true);
//         } else {
//             req.fileValidationError = 'فرمت فایل صحیح نیست.';
//             const error = new Error('فرمت فایل صحیح نیست.');
//             return cb(error, false);
//         }
//     }
// });

multer({
    dest: keys.appDir + '/public/cmsDocs/'
});

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, keys.appDir + '/public/cmsDocs/')
    },
    filename: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, file.originalname);
        } else {
            req.fileValidationError = 'فرمت فایل صحیح نمی‌باشد';
            req.fileValidationErrorEN = 'Invalid file format';
            cb(null, file.originalname);
        }
        
    }
});

let upload = multer({storage: storage});

/**
 * load the cms page(the page to upload files)
 * @returns cms.html
 */
router.get('/', function (req, res) {
    res.sendFile(__dirname + '/insertProduct.html');
    //res.sendFile(__dirname + '/cms.html');

});

/**
 * upload.single('fieldname') middleware:
 *      accept a single file with the name fieldname. The single file will be stored in req.file.
 */
//title/description/image/date
//const sharp = require('sharp');
router.post('/img/upload', passport.authenticate("jwt", {
    session: false
  }), upload.fields([{name: 'myImage', maxCount: 1}, {name: 'gallery', maxCount: 6}]), async(req, res) => {

    if(req.fileValidationError !== undefined && req.fileValidationError.length > 0){
        return res.status(400).json({error: 'فرمت فایل صحیح نمی‌باشد', errorEN: "Invalid file format"});
    }

    userAdminModel.findOne({
        email: req.user.email
    })
    .then(user => {
        if(!user) {
            error = "ادمینی با این مشخصات وجود ندارد";
            errorEN = "Admin not found";
            return res.status(404).json({error, errorEN});
        }
    })
    .catch(err => res.status(404).json(err));

    const {
        errors,
        isValid
      } = validateCMSUploadInput(req);

    if (!isValid) return res.status(400).json(errors);

    let files_to_save = [];

    if((req.body.id==undefined || req.body.id==0) || (req.body.photoChange != undefined && (req.body.photoChange === true || req.body.photoChange === "true"))) {
        
        if(req.files['myImage'] !== undefined){

            req.files['myImage'].map(file => {
                if (file.size > 5000000)
                    return res.status(400).json({error: 'حجم فایل نباید بیشتر از 5 مگابایت باشد', errorEN:"The file size should not exceed 5M"});
                else{
                    let dataPath = '';
                    var splitted = file.path.split(keys.lastDir);
                    if(splitted[1])
                        dataPath = splitted[1];
                    else{
                        dataPath = file.path;
                    }
                    const file_ = {
                        data: dataPath,//file.path,
                        contentType: file.mimetype
                    }
        
                    files_to_save.push(file_);
                }
            });
        }
        
    }

    let gallery = [];
    if(req.files['gallery'] !== undefined){

        if(req.body.id !== undefined && parseInt(req.body.id) !== 0){

            let gallery_ = await fileUploadModel
            .findOne(
                {
                    _id: req.body.id
                }
            )
            .select({_id: 0, gallery: 1})
            .lean()
            .exec();
    
            if(gallery_ !== undefined && gallery_.gallery !== undefined){
                if((parseInt(gallery_.gallery.length) + parseInt(req.files['gallery'].length)) > 6){
                    return res.status(400).json({error: 'تعداد تصاویر گالری بیش از حد مجاز می‌باشد', 
                                                errorEN: "The number of images is out of range"});
                }
            }
        }else{
            if(parseInt(req.files['gallery'].length) > 6){
                return res.status(400).json({error: 'تعداد تصاویر گالری بیش از حد مجاز می‌باشد', 
                                            errorEN: "The number of images is out of range"});
            }
        }
        
        await Promise.all(req.files['gallery'].map(file => {

            if (file.size > 5000000){
                return res.status(400).json({error: 'حجم فایل نباید بیشتر از 5 مگابایت باشد',
                                            errorEN: "The file size should not exceed 5M"});
            }else{

                // sharp(file.path).resize(200, 200).toFile(keys.appDir + '/public/cmsThumbnails/thumbnail-' + file.originalname, (err, resizedImg) => {
                    
                // });

                let dataPath = '';
                var splitted = file.path.split(keys.lastDir);
                if(splitted[1])
                    dataPath = splitted[1];
                else{
                    dataPath = file.path;
                }
                
                gallery.push({
                    data : dataPath,//file.path,
                    thumbnail: 'public\\cmsThumbnails\\thumbnail-' + file.originalname
                });

                
            }
        })
        );
        
    }

    if(req.body.name === undefined || req.body.name === 'undefined')              req.body.name = "";
    if(req.body.fileTitle === undefined || req.body.fileTitle === 'undefined')      req.body.fileTitle = "";
    if(req.body.caption === undefined || req.body.caption === 'undefined')          req.body.caption = "";
    if(req.body.description === undefined || req.body.description === 'undefined')  req.body.description = "";
    if(req.body.reference === undefined || req.body.reference === 'undefined')      req.body.reference = "";
    if(req.body.tags === undefined || req.body.tags === 'undefined')                req.body.tags = "";
    if(req.body.date === undefined || req.body.date === 'undefined')                req.body.date = "";
    if(req.body.year === undefined || req.body.year === 'undefined')                req.body.year = "";
    if(req.body.month === undefined || req.body.month === 'undefined')              req.body.month = "";
    if(req.body.day === undefined || req.body.day === 'undefined')                  req.body.day = "";
    if(req.body.url === undefined || req.body.url === 'undefined')                  req.body.url = "";

    if(req.body.id==undefined || req.body.id==0) {
        const newFile = new fileUploadModel({
            name: req.body.name, 
            title: req.body.fileTitle, 
            caption: req.body.caption, 
            description: req.body.description, 
            year: req.body.year, 
            month: req.body.month, 
            day: req.body.day, 
            reference: req.body.reference.split(/[,،]/), 
            tags: req.body.tags.split(/[,،]/), 
            news_date: req.body.date,
            files: files_to_save,
            gallery: gallery,
            url: req.body.url
        });
        
        newFile.save().then(update_news => {
            if(update_news !== undefined){

                update_news.files.forEach(file => {

                    file.data = file.data.slice(6);

                });

                update_news.gallery.forEach(file => {

                    if(file.data !== undefined)
                        file.data = file.data.slice(6);
                    if(file.thumbnail !== undefined)
                        file.thumbnail = file.thumbnail.slice(6);

                });
            }
            return res.status(200).send(update_news);
        });
    }
    else {
        if(req.body.photoChange != undefined && (req.body.photoChange === true || req.body.photoChange === "true")) {
            fileUploadModel.findOneAndUpdate(
                {
                    _id: req.body.id
                },
                {
                    $set: {
                        name: req.body.name, 
                        title: req.body.fileTitle, 
                        caption: req.body.caption, 
                        description: req.body.description, 
                        year: req.body.year, 
                        month: req.body.month, 
                        day: req.body.day, 
                        reference: req.body.reference.split(/[,،]/), 
                        tags: req.body.tags.split(/[,،]/), 
                        news_date: req.body.date,
                        files: files_to_save,
                        url: req.body.url
                    },
                    $push: {gallery: gallery}
                }, 
                {
                    new: true
                }
            )
            .then(update_news => {
                if(update_news !== undefined){

                    update_news.files.forEach(file => {
    
                        file.data = file.data.slice(6);
    
                    });
    
                    update_news.gallery.forEach(file => {
    
                        if(file.data !== undefined)
                            file.data = file.data.slice(6);
                        if(file.thumbnail !== undefined)
                            file.thumbnail = file.thumbnail.slice(6);
    
                    });
                }
                return res.status(200).send(update_news);
            });
        }
        else {
            fileUploadModel.findOneAndUpdate({
                    _id: req.body.id
                },{
                    $set: {
                        name: req.body.name, 
                        title: req.body.fileTitle, 
                        caption: req.body.caption, 
                        description: req.body.description, 
                        year: req.body.year, 
                        month: req.body.month, 
                        day: req.body.day, 
                        reference: req.body.reference.split(/[,،]/), 
                        tags: req.body.tags.split(/[,،]/), 
                        news_date: req.body.date,
                        url: req.body.url
                    },
                    $push: {gallery: gallery}
                }, {
                    new: true
                }
            )
            .then(update_news => {
                if(update_news !== undefined){

                    update_news.files.forEach(file => {
    
                        file.data = file.data.slice(6);
    
                    });
    
                    update_news.gallery.forEach(file => {
    
                        if(file.data !== undefined)
                            file.data = file.data.slice(6);
                        if(file.thumbnail !== undefined)
                            file.thumbnail = file.thumbnail.slice(6);
    
                    });
                }
                return res.status(200).send(update_news);
            });
        }
    }
});

router.post('/gallery/remove', passport.authenticate("jwt", {
    session: false
  }), async (req, res) => {

    if(req.body.galleryID === undefined || req.body.cmsID === undefined){
        return res.status(400).json({error: 'خطا در پارامترهای ورودی', errorEN: "Invalid input"});
    }else{
        await fileUploadModel
        .update(
            {
                _id: req.body.cmsID
            },
            {
                $pull: {gallery: {_id: req.body.galleryID}}
            }
        )
        .exec();

        let galleries = await fileUploadModel
        .find(
            {
                _id: req.body.cmsID
            }
        )
        .select({'_id': 0, 'gallery': 1})
        .exec();

        if(galleries !== undefined && galleries !== null && galleries.length > 0){
            await Promise.all(galleries[0].gallery.map(gal => {

                if(gal.data !== undefined)
                    gal.data = gal.data.slice(6);

                if(gal.thumbnail !== undefined)
                    gal.thumbnail = gal.thumbnail.slice(6);
            }))
            return res.status(200).send(galleries[0].gallery);
        }else{
            return res.status(200).send({galleries: []});

        }

    }
});

router.get('/content', async (req, res) => {
  
    let current_year = parseInt(moment().format('jYYYY'));
    let current_month = parseInt(moment().format('jM'));
    let current_day = parseInt(moment().format('jD'));

    let result = "";
    let news = await fileUploadModel.find()
        .sort({year:1, month: 1, day: 1, _id: 1})
        .collation({ locale: "en_US", numericOrdering: true })
        .exec();
        if(news) {
            /**
             * temporary changes: previewing an index of news, each containing collection of images, description,
             * date, title, image-caption, references and tags.
             * this block will be moved to front-end and just the "news json" will be respond.
             * @returns news
             */

            //console.log("news"+news);
            let result = [];
            news.map(el => {
                let res = {};
                let new_files = [];
                let gallery = [];
                el.files.forEach(file => {

                    file.data = file.data.slice(6);

                    // let new_file = {};
                    
                    // new_file.data = file.data.toString("base64");
                    // new_file.contentType = file.contentType;
                    // new_file._id = file._id;

                    new_files.push(file);
                });

                if(el.gallery !== undefined){

                    el.gallery.forEach(file => {

                        if(file.data !== undefined)
                            file.data = file.data.slice(6);

                        if(file.thumbnail !== undefined)
                            file.thumbnail = file.thumbnail.slice(6);
    
                        gallery.push(file);
                    });
                }
                
                let comments = [];
                el.comments.map(comment => {
                    if(comment.accepted){
                        comments.push(comment);
                    }
                });

                res.reference   = el.reference.toString();
                res.tags        = el.tags.toString();
                res.news_date   = el.news_date/*.toString()*/;
                res.create_date = el.create_date.toString();
                res.id          = el._id.toString();
                res.title       = el.title.toString();
                res.year        = el.year;
                res.month       = el.month;
                res.day         = el.day;
                res.caption     = el.caption.toString();
                res.description = el.description.toString();
                res.files       = new_files;//el.files;
                res.comment     = comments;//el.comments.length > 0 ? el.comments : '';
                res.gallery     = gallery;
                
                result.push(res);
            });
            let reversed = result.reverse();
            res.send(reversed);
        }
});

router.post('/contentOne', (req, res) => {
    //let result = "";
    fileUploadModel
        .findOne(
            {_id: req.body.params.id}
        )
        .then(el => {

                let result = {};
                let new_files = [];
                let gallery = [];
                el.files.forEach(file => {
                    
                    file.data = file.data.slice(6);
                    new_files.push(file);
                });

                if(el.gallery !== undefined){

                    el.gallery.forEach(file => {

                        if(file.data !== undefined)
                            file.data = file.data.slice(6);

                        if(file.thumbnail !== undefined)
                            file.thumbnail = file.thumbnail.slice(6);
    
                        gallery.push(file);
                    });
                }
                
                let comments = [];
                el.comments.map(comment => {
                    if(comment.accepted){
                        comments.push(comment);
                    }
                });
                
                result.reference   = el.reference.toString();
                result.tags        = el.tags.toString();
                result.news_date   = el.news_date;
                res.year           = el.year;
                res.month          = el.month;
                res.day            = el.day;
                result.create_date = el.create_date.toString();
                result.id          = el._id.toString();
                result.title       = el.title.toString();
                result.caption     = el.caption.toString();
                result.description = el.description.toString();
                result.files       = new_files;//el.files;
                result.comment     = comments;//el.comments.length > 0 ? el.comments : '';
                result.gallery     = gallery;
                
            
            res.send(result);
        })
        .catch(err => {console.log(err)
            return res.json({error: "عملیات ناموفق", errorEN: "operation failed"});
            //"خطا در نمایش فایل. مجددا تلاش نمایید."
        });
});
/**
 * @param id - photo_id
 * @returns photo
 */
router.get('/content/:ids', (req, res) => {
    let result = "";
    fileUploadModel
        .find({
        '_id':{ 
            $in : req.params.ids.split(',')
        }
    })
        .then(news => {
            /**
             * temporary changes: previewing an index of news, each containing collection of images, description,
             * date, title, image-caption, references and tags.
             * this block will be moved to front-end and just the "news json" will be respond.
             * @returns news
             */
            news.map(el => {
                result += 
                    `<span style="display:block; vertical-align: text-top; margin-right: 110px; margin-top: 90px; direction:rtl;">
                    <h1 style=" text-align:right; direction:rtl;"><b>${el.title}</b></h1>
                    <p style=" text-align:right;"><i><span>تاریخ خبر: </span>${el.news_date}</i></p>`;
                    
                el.files.map(file => {
                    result += 
                    `<figure style="display: inline-block;">
                        <img src=${file.data} width="200" height="200">
                        <figcaption style="text-align:center; margin-top:10px;">${el.caption}</figcaption>
                    </figure>`;
                });

                result += 
                    `<p style=" text-align:right;">${el.description}</p>
                    <p style=" direction:rtl; color:#2874A6;"><span>منابع: </span>${el.reference}</p>
                    <p style=" direction:rtl;"><span>کلمات کلیدی: </span>${el.tags}</p></span>`;
            });
            
            res.send(result);
        })
        .catch(err => {
            return res.json({error: "عملیات ناموفق", errorEN: "operation failed"});
            //"خطا در نمایش فایل. مجددا تلاش نمایید."
        });
});

router.get('/all/content', (req, res) => {
    let result = "";
    fileUploadModel
        .find()
        .then(news => {
            /**
             * temporary changes: previewing an index of news, each containing collection of images, description,
             * date, title, image-caption, references and tags.
             * this block will be moved to front-end and just the "news json" will be respond.
             * @returns news
             */
            news.map(el => {
                
                result += 
                    `<span style="display:block; vertical-align: text-top; margin-right: 110px; margin-top: 90px; direction:rtl;">
                    <h1 style=" text-align:right; direction:rtl;"><b>${el.title}</b></h1>
                    <p style=" text-align:right;"><i><span>تاریخ خبر: </span>${el.news_date}</i></p>`;
                    
                el.files.map(file => {
                    file.data = file.data.slice(6);
                    result += 
                    `<figure style="display: inline-block;">
                        <img src=${file.data}>
                        <figcaption style="text-align:center; margin-top:10px;">${el.caption}</figcaption>
                    </figure>`;
                });

                result += 
                    `<p style=" text-align:right;">${el.description}</p>
                    <p style=" direction:rtl; color:#2874A6;"><span>منابع: </span>${el.reference}</p>
                    <p style=" direction:rtl;"><span>کلمات کلیدی: </span>${el.tags}</p></span>`;
            });
            
            res.send(result);
        })
        .catch(err => {
            return res.json({error: "عملیات ناموفق", errorEN: "operation failed."});
            //"خطا در نمایش فایل. مجددا تلاش نمایید."
        });
});

router.post('/comment/insert', (req, res) => {
    if(isEmpty(req.body.text)){
        return res.status(400).json({error: 'وارد کردن متن کامنت الزامی است', errorEN: "Error, empty comment"});
    }else if(isEmpty(req.body._id)){
        return res.status(400).json({error: 'وارد کردن شناسه خبر الزامی است', errorEN: "Please Enter the news id"});
    }

    let new_comment = {};
    new_comment.text = req.body.text;
    new_comment.date = moment().format('jYYYY/jM/jD HH:mm');
    new_comment.accepted = false;

    if(!isEmpty(req.body.name)) new_comment.name = req.body.name;
    if(!isEmpty(req.body.email)) new_comment.email = req.body.email;

    fileUploadModel.findOneAndUpdate(
        {_id: req.body._id},
        {$push: {comments: new_comment}}
    )
    .then(() => {
        return res.status(200).json({result: 'ذخیره کامنت باموفقیت انجام شد', 
                                    resultEN:"Comment saved successfully"});
    })
    .catch(err => {
        return res.status(400).json({error: 'عملیات ناموفق', errorEN: "operation failed"});
        //خطا در ذخیره کامنت
    });
});

router.get('/comment/getAll', passport.authenticate("jwt", {
    session: false
  }), async(req, res) => {
    userAdminModel.findOne({
        email: req.user.email
    })
    .then(user => {
        if(!user) {
            error = "کاربری با این مشخصات یافت نشد";
            errorEN = "User not found";
            return res.status(404).json({error, errorEN});
        }
    })
    .catch(err => res.status(404).json(err));
    let response = [];
    await fileUploadModel
        .find()
        .then(els => {
            els.map(el => {

                let result = {};
                let comments = [];

                el.comments.map(comment => {
                    //if(comment.accepted){
                        comments.push(comment);
                    //}
                });

                if(comments.length > 0){
                    result.id          = el._id.toString();
                    result.title       = el.title.toString();
                    result.comment     = comments;

                    response.push(result);
                }
                
            });
            
            res.status(200).json(response);
                
        })
        .catch(err => {
            console.log(err)
            res.status(400).json({error: "عملیات ناموفق", errorEN: "Operation failed"});
            //خطا در نمایش کامنت‌ها. مجددا تلاش نمایید
        });
});

router.post('/comment/update', passport.authenticate("jwt", {
    session: false
  }), (req, res) => {
    try{
        userAdminModel.findOne({
            email: req.user.email
        })
        .then(user => {
            if(!user) {
                error = "کاربری با این مشخصات یافت نشد";
                errorEN = "User not found"
                return res.status(404).json({error, errorEN});
            }
        })
        .catch(err => res.status(404).json(err));
        req.body.comments.map(comment => {

            if(comment.newsID <= 0 || comment.commentID <= 0){
                return res.status(400).json({error: 'خطا در پارامترهای ورودی', errorEN: "Invalid input"});
            }else{
    
                fileUploadModel
                .findOneAndUpdate(
                    {
                        _id: comment.newsID,
                        comments: {$elemMatch: {_id: comment.commentID}}
                    },
                    {
                        $set: {"comments.$.accepted": comment.accepted}
                    }
                )
                .then(() => {})
                .catch(err => {
                    console.log('db catch error', err);
                    return res.status(400).json({error: 'خطا در به روزرسانی کامنت‌ها', 
                                                errorEN: "Comments update failed"});
                });
    
            }
    
        });
    }catch(err){
        console.log('catch error', err);
        return res.status(400).json({error: 'خطا در به روزرسانی کامنت‌ها', errorEN:"Comments update failed"});
    }
    return res.status(200).json({result: 'به روزرسانی کامنت‌ها با موفقیت انجام شد',
                                resultEN: "Comments updated successfully"});
});

router.get('/getAdmin', passport.authenticate("jwt", {
    session: false
  }), (req, res) => {
    userAdminModel.findOne({
        email: req.user.email
    })
    .then(user => res.status(200).json(user))
    .catch(err => res.status(404).json({message: 'کاربری با این مشخصات یافت نشد', 
                                        messageEN:"User not found"}));
});

router.post('/delete', passport.authenticate("jwt", {
    session: false
  }), async (req, res) => {

    userAdminModel.findOne({
        email: req.user.email
    })
    .then(user => {
        if(!user) {
            error = "کاربری با این مشخصات یافت نشد";
            errorEN = "User not found";
            return res.status(404).json({error, errorEN});
        }
    })
    .catch(err => res.status(404).json(err));

    if(req.body._id === undefined){
        return res.status(400).json({error: 'وارد کردن شناسه خبر الزامی است', errorEN:"Please enter the news id"});
    }else{
        await fileUploadModel
        .findOneAndDelete(
            {
                _id: req.body._id
            }
        )
        .exec();

        return res.status(200).json({result: 'خبر با موفقیت حذف شد', resultEN: "The news is deleted successfully"});
    }
});
  
module.exports = router;