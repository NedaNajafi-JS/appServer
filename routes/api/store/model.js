/**
 * use express module
 * require contact schema
 * require email page
 */
 const chargerProductModel = require('../../../models/store/Chargers');
 const express = require('express');
 const router = express();
 const multer = require('multer'); 
 //const upload = multer({dest: __dirname + '/charger.html'});
 const fs = require('fs');
 const keys = require('../../../config/keys');

 /**
 * cb is multer's callback. The first argument is the error 
 * and the next argument specifies if everything went ok(true) or not(false).
 */

multer({
    dest: keys.appDir + '/public/models/'
//'public/models/'
});
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, keys.appDir + '/public/models/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }, fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/glb") {
            cb(null, true);
        } else {
            req.fileValidationError = 'فرمت فایل صحیح نمی‌باشد';
            const error = new Error('فرمت فایل صحیح نمی‌باشد');
            return cb(error, false);
        }
    }
});

let upload = multer({storage: storage});
  
router.get('/docHTML', function (req, res) {
      res.sendFile(__dirname + '/charger.html');
  
});
  
router.post('/model/upload', upload.array('myModel', 10) , async (req, res) => {
    let files_to_save =  [];
    req.files.map(file => {
        if (file.size > 5000000)
            res.send('حجم فایل نباید بیشتر از 5 مگابایت باشد');
        console.log(file.path);

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
    });
  
    if(files_to_save.length > 0) {
        chargerProductModel
        .findOneAndUpdate(
            {
            "_id": req.body.chargerId
            },
            {
            $push: {model: files_to_save}
            }
        )
        .then((Charger) => {
            if(Charger){
                //insert log
                /*let log = new logModel({
                    typeID: 1,
                    type:1, //insert
                    field: "docs",
                    changeDate: Date.now(),
                    userID: user._id
                });
        
                log.save()
                .then(() => {*/
                    return res.status(200).send(Charger);
               // });
        
            }else{
                return res.status(400).json('failed');
            }
        })
        .catch(err =>{
            return res.status(400).json(err);
        });
        
    }else{
      res.status(200).json('success');
    }
});

module.exports = router;