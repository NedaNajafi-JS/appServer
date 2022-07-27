/**
 * use express module
 * require contact schema
 * require email page
 */
const FAQ = require('../../../models/store/FAQ');
const express = require('express');
const router = express();

/**
 * Save complaint form information
 */
router.post('/insert', async (req,res)=>{

    const info = {};
    info.question = req.body.question;
    info.answer = req.body.answer;

    new FAQ(info).save()
    .then(faq => { 
        res.status(200).send("ذخیره با موفقیت انجام شد")
    })
    .catch(err => res.json(err));
});

/**
 * Save complaint form information
 */
/*router.post('/insertresponse',async (req,res)=>{
  
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
});*/

//get Pays
router.get('/get', (req, res) => {
	FAQ.find()
	.then(async (resp) => {
		res.status(200).send(resp)
	})
	.catch(err => res.status(404).json(err));
});

module.exports = router;