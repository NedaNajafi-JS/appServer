
const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const randtoken = require('rand-token');
const jwt = require("jsonwebtoken");

const db = require('../../../config/keys').mongoURI;// DB Config
const keys = require("../../../config/keys");
const RefTok = require('../../../models/store/RefTok');
let isEmpty = require('../../../validation/is-empty');
const userAdminModel = require('../../../models/userAdmin');
// @route   GET api/cms/login
// @desc    Login admin / Returning JWT Token
// @access  Public
router.post("/", (req, res) => {
    let errors = {};
    if (isEmpty(req.body.username)) {
        errors.username = "وارد کردن نام کاربری الزامی است";
        //return res.status(400).json(errors);
    }
    if (isEmpty(req.body.password)) {
        errors.password = "وارد کردن رمز ورود الزامی است";
        //return res.status(400).json(errors);
    }
    if(!isEmpty(errors)) {
        /*let result = {
            status: 400,
            error : errors
        }*/
       // console.log(result.error)
        return res.status(400).json(errors);
    }

    const username = req.body.username;
    const password = req.body.password;

    // Find user by email
    userAdminModel.findOne({
        username: username
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
module.exports = router;