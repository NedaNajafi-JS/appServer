/**
 * use express module
 * require contact schema
 * require email page
 * نظرات کاربران
 */
const charger = require('../../../models/store/Chargers');
const operation = require('../../../models/store/operation');
const operationDetail = require('../../../models/store/operationDetail');
const express = require('express');
const router = express();
const passport = require("passport");

/**
 * Save complaint form information
 */
router.post('/insert', passport.authenticate("jwt", {
    session: false
  }), async (req,res)=>{

    let info = {};
    info.description = req.body.description;
    info.date = Date.now();
    info.profileID = req.user._id;
    info.confirmed = false;

    let userOperations = await operation.find({
        profileID: req.user._id,
        status: 7
    })
    .lean()
    .select({'_id': 1})
    .exec();

    let opIDs = [];
    if(userOperations !== undefined){
        await Promise.all(userOperations.map(userop => {
            opIDs.push(userop._id.toString());
        }));

        const opDet = await operationDetail
        .findOne(
            {
                operationID: {$in : opIDs},
                productID: req.body.chargerId
            }
        )
        .lean()
        .exec();

        if(!opDet){
            return res.status(400).json('کاربر گرامی، شما دسترسی ثبت نظر برای کالای انتخابی را ندارید');
        }else{
            const product = await charger.findOneAndUpdate(
                {
                    _id: req.body.chargerId
                },
                {
                    $push: { review: info}
                },
                {
                    new: true
                }
            )
            .exec();
        
            if(product){
                return res.status(200).send(product);
            }else{
                return res.status(400).json('کالایی با این مشخصات یافت نشد');
            }
        }
    }else{
        return res.status(400).json('کاربر گرامی، شما دسترسی ثبت نظر برای کالای انتخابی را ندارید');

    }
    
});

//get reviews
router.post('/getreview', async (req, res) => {
    let reviews = "";

    if(req.body.confirmed !== undefined){

        reviews = await charger
        .findOne(
            {
                _id: req.body.chargerId,
                review: { $elemMatch: {confirmed: req.body.confirmed}}
            }
        )
        .select('review')
        .exec();

    }else{

        reviews = await charger
        .findOne(
            {
                _id: req.body.chargerId
            }
        )
        .select('review')
        .exec();

    }
    
    let result = [];
    if(reviews){
        await Promise.all(
            reviews.review.map(review => {
                if(review.confirmed === req.body.confirmed){
                    result.push(review);
                }
            })
        )
    }
    
    return res.status(200).send(result);
	
});


router.post('/confirm', async (req, res) => {

    if(req.body.confirmed === undefined){
        return res.status(400).json('خطا در پارامتر ورودی تائید/عدم تائید');
    }
    if(req.body.commentID === undefined){
        return res.status(400).json('خطا در پارامتر ورودی شناسه کامنت');
    }
    if(req.body.chargerId === undefined){
        return res.status(400).json('خطا در پارامتر ورودی شناسه کالا');
    }

    const product = await charger
    .findOneAndUpdate(
        {
            _id: req.body.chargerId,
            review: {$elemMatch: {_id: req.body.commentID}}
        },
        {
            $set: {"review.$.confirmed": req.body.confirmed}
        },
        {
            new: true
        }
    )
    .exec();

    if(product)
        return res.status(200).send(product);
    else{
        return res.status(400).json('کالایی با این مشخصات یافت نشد');
    }
});

module.exports = router;