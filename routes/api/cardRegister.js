const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Profile = require('../../models/Profile');

/**
 * Change the way messages are displayed to the user
 */
router.post('/reg',(req, res)=> {
    if(req.body.username=="operator" && req.body.password=="EVIDC"){
        res.status(200).json({result: "مورد تایید", resultEN: "Confirmed"})
    }else{
        res.status(401).json({error: "غیرمجاز", errorEN: "Invalid"});
    }
});
/**
 * Change the way messages are displayed to the user
 */
router.post('/drivers',(req, res)=> {
    if(req.body.username=="operator" && req.body.password=="EVIDC"){
     Profile.find({}).select({namee:1})
	.then(users=> {
        res.send(users)
	}).catch(err => res.status(404).json(err));
    }else{
        res.status(401).json({error: "غیرمجاز", errorEN: "Invalid"});
    }

});
/**
 * Change the way messages are displayed to the user
 */
router.post('/driver',(req, res)=> {
    if(req.body.username=="operator" && req.body.password=="EVIDC"){
	Profile.find({_id:req.body.driver})
	.then(user=> {
        res.send(user)
	}).catch(err => res.status(404).json(err));        
    }else{
        res.status(401).json({error: "غیرمجاز", errorEN: "Invalid"});
    }    
});
/**
 * Change the way messages are displayed to the user
 */
router.post('/update',(req, res)=> {

  if(req.body.username=="operator" && req.body.password=="EVIDC"){

    if(parseInt(req.body.prefixe) === 98 || req.body.prefixe === undefined){

        Profile.findOneAndUpdate({_id:req.body.driver}, {$set: {
            rfidserial:req.body.rfid,
            currency: req.body.currency
        }
        })
        .then(user=> {
            res.send(user)
        }).catch(err => res.status(404).json(err)); 
    }else{

        Profile.findOneAndUpdate({_id:req.body.driver}, {$set: {
            rfidserial:req.body.rfid,
            currencyUsd: req.body.currency
        }
        })
        .then(user=> {
            res.send(user)
        }).catch(err => res.status(404).json(err));
    }
       
    }else{
        res.status(401).json({error: "غیرمجاز", errorEN: "Invalid"});
    }    
});


module.exports = router;