/**
 * use express module
 * require contact schema
 * require email page
 */
const question = require('../../../models/store/question');
const express = require('express');
const router = express();

/**
 * Save complaint form information
 */
router.post('/insertquestion',async (req,res)=>{
    /*const {
        errors,
        isValid
    } = validateComplaintInput(req.body);
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }*/

    const info = {};
    info.questioner = req.body.questioner;
    info.question = req.body.question;
    info.chargerId = req.body.chargerId;

    new question(info).save()
    .then(Question => { 
        res.status(200).send("ذخیره با موفقیت انجام شد")
    })
    .catch(err => res.json(err));
});

/**
 * Save complaint form information
 */
router.post('/insertresponse',async (req,res)=>{
    /*const {
        errors,
        isValid
    } = validateComplaintInput(req.body);
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }*/
    let array=[];
    let info = {};
    info.responder = req.body.responder;
    info.text = req.body.response;
    array.push(info);
    question.findOneAndUpdate(
        {
            chargerId: req.body.chargerId,
            "_id": req.body.questionId
        },
        {
            $push: {response: array}
        }
    )
    .then((Question) => {
        if(Question){
            return res.status(200).send(Question);
        }else{
            return res.status(400).json('عملیات ناموفق');
        }
    })
    .catch(err =>{
        return res.status(400).json(err);
    });
});

//get Pays
router.post('/getquestion', (req, res) => {
	// review.find({
    //     chargerId : req.body.chargerId
    // })
	// .then(async (resp) => {
	// 	res.status(200).send(resp)
	// })
	// .catch(err => res.status(404).json(err));
});

module.exports = router;