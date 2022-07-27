const appConfig = require('../../models/appConfig');
const express = require('express');
const router = express();

router.post('/insertversion',async (req,res)=>{
    try{
        console.log('insertversion');

        await appConfig.findOneAndUpdate({
            _id: "5f27912893529f1bc052a606"
        }, {
            $set: {
                version: req.body.version
            }
        });
        res.status(200);
        return res.json({result:"ذخیره ورژن با موفقیت انجام شد", resultEN: 'The version is saved successfully'});
    }
    catch(err){
        res.status(400);
        res.send(err.message);
        console.log(err.message);
    }
    
})
router.get('/getversion',async (req,res)=>{
    try{
        console.log('getversion');
        let data=await appConfig.findOne({}, function(err, result) {
            if (err) throw err;
            console.log(result);
        });
        if(data==null)
        {
            const newFile = new appConfig({
                version: "1.0", 
            });
            
            await newFile.save();
            let data1=await appConfig.findOne({}, function(err, result) {
                if (err) throw err;
                console.log(result);
            });
            data=data1
        }
        res.status(200);
        return res.send({version:data.version});
    }
    catch(err){
        res.status(400);
        res.send(err.message);
        console.log(err.message);
    }
    
})
module.exports = router;
