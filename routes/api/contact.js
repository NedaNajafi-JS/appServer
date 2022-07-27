/**
 * use express module
 * require contact schema
 * require email page
 */
const contact = require('../../models/contact');
const response = require('../../models/contact_response');
const express = require('express');
const router = express();
const validateContactInput = require("../../validation/contact");
const validateContactResponseInput = require('../../validation/contact_response');

const sendemail = require('./email');
const passport = require("passport");
/**
 * Save contact form information
 */
router.post('/insert',async (req,res)=>{
    const {
        errors,
        isValid
      } = validateContactInput(req.body);
      if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
      }

    if(req.body.phone !== undefined && req.body.prefixe !== undefined){
      const phone = req.body.prefixe.toString() + req.body.phone.toString();
      req.body.phone = phone;
    }
    
    if(req.body.phone === undefined){
      req.body.phone = '-';
    }
    
    const contact_info = {};
    contact_info.name = req.body.name;
    contact_info.phone = req.body.phone;
    contact_info.email = req.body.email; 
    contact_info.subject = req.body.subject;
    contact_info.message = req.body.message;
    contact_info.type = req.body.type;
    contact_info.unread = true;

    new contact(contact_info).save()
    .then(user => { 
      var html=  '<p dir="rtl">نام و نام خانوادگی : '+contact_info.name+ '</p><p dir="rtl">شماره تلفن همراه : '+ contact_info.phone+'</p><p dir="rtl">ایمیل : '+ contact_info.email+' </p> <p dir="rtl">موضوع : ' +contact_info.subject+' </p><p dir="rtl">پیام : '+contact_info.message+'</p>'
      var htmlEN=  '<p dir="rtl">First name and last name: '+contact_info.name+ '</p><p dir="rtl">Phone number: '+ contact_info.phone+'</p><p dir="rtl">Email address: '+ contact_info.email+' </p> <p dir="rtl">Subject: ' +contact_info.subject+' </p><p dir="rtl">Message: '+contact_info.message+'</p>'
    subject='فرم تماس با ما';
    let subjectEN = "Contact us.";
    /*var html='<html><body><img style="width:100%;"   src="https://ir61.uploadboy.com/d/2us7yrf7jrmr/qnnfhrpojcghjeghvqvtzw6cxpczdj26uaxgns2in3icn663cb5vxbzibzhqesof524wz267/download.jfif" alt="img"></html></body>';
    subject='به جمع مشتریان مرکز خودرو برقی و زیرساخت های شارژ خوش آمدید.';*/
    
    if(parseInt(req.body.prefixe) === 98 || req.body.prefixe === undefined || req.body.prefixe === null || req.body.prefixe === ''){
      sendemail(html,contact_info.email,subject);
    }else{
      sendemail(htmlEN,contact_info.email,subjectEN);

    }
    return res.status(200).json({result: "ذخیره با موفقیت انجام شد", resultEN: "Success"});
    })
    .catch(err => res.json(err));
    
});

router.post('/getbytype', /*passport.authenticate("jwt", {
  session: false
}),*/async (req,res)=>{
  let Contact = await contact.find({
      type: req.body.type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
  })
  .sort({_id:-1})
  .lean()
  .exec();
  if (Contact){

      let page=req.body.page;
      let limit=req.body.limit;
      let starteIndex=(page-1)*limit;
      let endIndex=page*limit;
      let length = Contact.length;
      if(page!=0) {
          Contact = Contact.slice(starteIndex,endIndex);
      }
      Promise.all(Contact.map(async(comp) => {
                
          const Response = await response.find({
              contact_id: comp._id
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
          let Unread = await contact.find({
            unread:true
          })
          .exec();
          return res.status(200).json({result: Contact,total: length,unread:Unread.length});
      });
      
  }
});

router.post('/get', /*passport.authenticate("jwt", {
    session: false
  }),*/async (req,res)=>{
    let Contact = await contact.find({})
    .sort({_id:-1})
    .lean()
    .exec();
    if (Contact){
  
        let page=req.body.page;
        let limit=req.body.limit;
        let starteIndex=(page-1)*limit;
        let endIndex=page*limit;
        let length = Contact.length;
        if(page!=0) {
            Contact = Contact.slice(starteIndex,endIndex);
        }
        Promise.all(Contact.map(async(comp) => {
                  
            const Response = await response.find({
                contact_id: comp._id
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
            let Unread = await contact.find({
              unread:true
            })
            .exec();
            return res.status(200).json({result: Contact,total: length,unread:Unread.length});
        });
        
    }
});

router.post('/Response', /*passport.authenticate("jwt", {
  session: false
}),*/async (req,res)=>{
  const {
      errors,
      isValid
  } = validateContactResponseInput(req.body);
  if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
  }

  const info = {};
  info.name = req.body.name;
  info.response = req.body.response;
  info.contact_id = req.body.contact_id; 

  if(req.body.id!=undefined && req.body.id!=0) {
      response.findOneAndUpdate({
          _id: req.body.id
      }, {
          $set: {
              name : req.body.name,
              response : req.body.response,
              contact_id : req.body.contact_id,
              date:Date.now()
          }
      }, {    
      new: true
      })
      .then(async (Response) =>{
          let Contact = await contact.find({})
          .sort({_id:-1})
          .lean()
          .exec();
          if (Contact){

              let page=req.body.page;
              let limit=req.body.limit;
              let starteIndex=(page-1)*limit;
              let endIndex=page*limit;
              let length = Contact.length;
              if(page!=undefined && page!=0) {
                Contact = Contact.slice(starteIndex,endIndex);
              }
              Promise.all(Contact.map(async(comp) => {
                      
                  const Response = await response.find({
                    contact_id: comp._id
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
                  let Unread = await contact.find({
                      unread:true
                  })
                  .exec();
                  return res.status(200).json({result: Contact,total: length,unread:Unread.length});
              });
        }
    })
    .catch(err => console.log(err));
  }
  else {
      new response(info).save()
      .then( async (user) => { 
          let Contact_ = await contact.findOneAndUpdate({
              _id: req.body.contact_id
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
          if(Contact_) {
              let Contact = await contact.find({})
              .sort({_id:-1})
              .lean()
              .exec();
              if (Contact){

                  let page=req.body.page;
                  let limit=req.body.limit;
                  let starteIndex=(page-1)*limit;
                  let endIndex=page*limit;
                  let length = Contact.length;
                  if(page!=undefined && page!=0) {
                    Contact = Contact.slice(starteIndex,endIndex);
                  }
                  Promise.all(Contact.map(async(comp) => {
                          
                      const Response = await response.find({
                          contact_id: comp._id
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
                      let Unread = await contact.find({
                          unread:true
                      })
                      .exec();
                      return res.status(200).json({result: Contact,total: length,unread:Unread.length});
                  });
              }
          }
      })
      .catch(err => res.json(err));
  } 
});

router.post('/read', async(req, res) => {

    await contact
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

    let resp = await contact.find({})
    .sort({_id:-1})
    .lean()
    .exec();

    if (resp) {

        let Unread = await contact.find({
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
