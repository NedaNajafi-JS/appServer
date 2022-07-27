
const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const randtoken = require('rand-token');
const jwt = require("jsonwebtoken");

const db = require('../../../config/keys').mongoURI;// DB Config
const keys = require("../../../config/keys");
const RefTok = require('../../../models/store/RefTokPoll');
let isEmpty = require('../../../validation/is-empty');
const userAdminModel = require('../../../models/userAdmin');

router.post('/insertAdmin',async (req,res)=>{
    try{
        console.log('insertAdmin');

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
                    .then(() =>  res.status(200).send('اطلاعات با موفقیت ذخیره شد'))
                    .catch(err => res.status(400).json(err));
                });
            });
    }
    catch(err){
        res.status(400).send(err.message);
    }
});

// @route   GET api/store/polLogin
// @desc    Login admin / Returning JWT Token
// @access  Public
router.post("/", (req, res) => {
    let errors = {};
    if (isEmpty(req.body.username)) {
        errors.username = "وارد کردن نام کاربری الزامی است";
    }
    if (isEmpty(req.body.password)) {
        errors.password = "وارد کردن رمز ورود الزامی است";
    }
    if(!isEmpty(errors)) {
        return res.status(400).json(errors);
    }

    const username = req.body.username;
    const password = req.body.password;

    // Find user by email
    userAdminModel.findOne({
        username: username,
        role: "poll"
    })
    .then(user => {
        // Check for user
        if (!user) {
            errors.username = "ادمینی با این مشخصات وجود ندارد";
            return res.status(400).json(errors);
        }
        // Check Password
        bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
            // User Matched
            // const payload = { id: user.id, email: user.email }; // Create JWT Payload
            const payload = {
            id: user.id,
            username: user.username
            }; // Create JWT Payload

            let refreshToken = randtoken.uid(256)
            //refreshTokens[refreshToken] = user.name;
            const newRefreshToken = new RefTok({
            refreshToken: refreshToken,
            user: user.id,
            username: user.username
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
                username: user.username
                });
            }
            );
        } else {
            errors.password = "رمز ورود اشتباه است";
            return res.status(400).json(errors);
        }
        });
    })
    .catch(err => res.send(err));
});

router.post('/getAdmin', async (req, res) => {

    let token = '';
    let user = '';
    if(req.body.params){
        token = req.body.params.Authorization;
        const decoded = jwt.verify(token, keys.secretOrKey);

            user = await userAdminModel.findOne(
            {
                _id: decoded.id,
                role: "poll"
            }
        )
        .exec();
    }
    if(user) 
        res.status(200).json(user);
    else
    res.status(404).json({message: 'کاربری با این مشخصات وجود ندارد'});
});

module.exports = router;