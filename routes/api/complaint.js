/**
 * use express module
 * require contact schema
 * require email page
 */
const complaint = require('../../models/complaint');
const response = require('../../models/complaint_response');
const express = require('express');
const router = express();
const validateComplaintInput = require("../../validation/complaint");
const validateComplaintResponseInput = require('../../validation/complaint_response');
const userAdmin = require('../../models/userAdmin');
const keys = require('../../config/keys');
const jwt = require('jsonwebtoken');
const passport = require("passport");

/**
 * Save complaint form information
 */
router.post('/insert',async (req,res)=>{
    const {
        errors,
        isValid
    } = validateComplaintInput(req.body);
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }

    const complaint_info = {};
    complaint_info.name = req.body.name;
    complaint_info.phone = req.body.phone;
    complaint_info.email = req.body.email; 
    complaint_info.subject = req.body.subject;
    complaint_info.message = req.body.message;
    complaint_info.unread = true;

    new complaint(complaint_info).save()
    .then(user => { 
        res.status(200).json({result: "ذخیره با موفقیت انجام شد", resultEN: "Success"})
    })
    .catch(err => res.json(err));
})


/**
 * get complaint information
 */
 router.post('/get', passport.authenticate("jwt", {
    session: false
  }),async (req,res)=>{
    let Complaint = await complaint.find()
    .sort({_id:-1})
    .lean()
    .exec();
    if (Complaint){

        let page=req.body.page;
        let limit=req.body.limit;
        let starteIndex=(page-1)*limit;
        let endIndex=page*limit;
        let length = Complaint.length;
        if(page!=0) {
            
            Complaint = Complaint.slice(starteIndex,endIndex);
        }
        Promise.all(Complaint.map(async(comp) => {
                
            const Response = await response.find({
                complaint_id: comp._id
            })
            .lean()
            .exec();
            if(Response.length!=0) {
                comp.response = Response;
            }
            else {
                comp.response=[];
            }
        }))
        .then(async() => {
            let Unread = await complaint.find({
                unread:true
            })
            .exec();
            return res.status(200).json({result: Complaint,total: length,unread:Unread.length});
        });
    }
});

router.post('/Response', passport.authenticate("jwt", {
    session: false
  }),async (req,res)=>{
    const {
        errors,
        isValid
    } = validateComplaintResponseInput(req.body);
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }

    const info = {};
    info.name = req.body.name;
    info.response = req.body.response;
    info.complaint_id = req.body.complaint_id; 

    if(req.body.id!=undefined && req.body.id!=0) {
        response.findOneAndUpdate({
            _id: req.body.id
        }, {
            $set: {
                name : req.body.name,
                response : req.body.response,
                complaint_id : req.body.complaint_id,
                date:Date.now()
            }
        }, {    
        new: true
        })
        .then(async (Response) =>{
            let Complaint = await complaint.find()
            .sort({_id:-1})
            .lean()
            .exec();
            if (Complaint){

                let page=req.body.page;
                let limit=req.body.limit;
                let starteIndex=(page-1)*limit;
                let endIndex=page*limit;
                let length = Complaint.length;
                if(page!=undefined && page!=0) {
                    
                    Complaint = Complaint.slice(starteIndex,endIndex);
                }
                Promise.all(Complaint.map(async(comp) => {
                        
                    const Response = await response.find({
                        complaint_id: comp._id
                    })
                    .lean()
                    .exec();
                    if(Response.length!=0) {
                        comp.response = Response;
                    }
                    else {
                        comp.response=[];
                    }
                }))
                .then(async() => {
                    let Unread = await complaint.find({
                        unread:true
                    })
                    .exec();
                    return res.status(200).json({result: Complaint,total: length,unread:Unread.length});
                });
            }
        })
        .catch(err => console.log(err));
    }
    else {
        new response(info).save()
        .then( async (user) => { 
            let Complaint_ = await complaint.findOneAndUpdate({
                _id: req.body.complaint_id
            }, {
                $set: {
                    responsed:true,
                    unread:false
                }
            }, {
                new: true
            })
            .lean()
            .exec();
            if(Complaint_) {
                let Complaint = await complaint.find()
                .sort({_id:-1})
                .lean()
                .exec();
                if (Complaint){

                    let page=req.body.page;
                    let limit=req.body.limit;
                    let starteIndex=(page-1)*limit;
                    let endIndex=page*limit;
                    let length = Complaint.length;
                    if(page!=undefined && page!=0) {
                        
                        Complaint = Complaint.slice(starteIndex,endIndex);
                    }
                    Promise.all(Complaint.map(async(comp) => {
                            
                        const Response = await response.find({
                            complaint_id: comp._id
                        })
                        .lean()
                        .exec();
                        if(Response.length!=0) {
                            comp.response = Response;
                        }
                        else {
                            comp.response=[];
                        }
                    }))
                    .then(async() => {
                        let Unread = await complaint.find({
                            unread:true
                        })
                        .exec();
                        return res.status(200).json({result: Complaint,total: length,unread:Unread.length});
                    });
                }
            }
        })
        .catch(err => res.json(err));
    } 
});

router.post('/read', async(req, res) => {

    await complaint
    .findOneAndUpdate(
      {
        _id: req.body.id
      },
      {
        unread:false
      }, 
      {
        new: true
      }
    )
    .exec();

    let resp = await complaint.find({})
    .sort({_id:-1})
    .lean()
    .exec();

    if (resp) {

        let Unread = await complaint.find({
            unread:true
        })
        .exec();

        let page=req.body.page;
		let limit=req.body.limit;
		let starteIndex=(page-1)*limit;
		let endIndex=page*limit;
		if(page==0) {
			res.status(200).json({result: resp,total: resp.length,unread:Unread.length});
		}
		else {
			const result = resp.slice(starteIndex,endIndex);
			res.status(200).json({result: result,total: resp.length,unread:Unread.length});
        }
    };

    //res.status(200).send(Repair);
});

module.exports = router;
