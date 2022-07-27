let isEmpty = require('../../../../validation/is-empty');
const userAdminModel = require('../../../../models/userAdmin');
const RefTok = require('../../../../models/RefTokcms');

const express = require('express');
const jwt = require("jsonwebtoken");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const randtoken = require('rand-token');
const keys = require("../../../../config/keys");

const router = express.Router();

router.post("/login", (req, res) => {

    let errors = {};
    if (isEmpty(req.body.password)) {

        errors.password = "وارد کردن رمز ورود الزامی است";
        errors.passwordEN = "Please enter your password";
        return res.status(400).json(errors);
    }
    else if (isEmpty(req.body.email)) {

        errors.email = "وارد کردن ایمیل الزامی است";
        errors.emailEN = "Please enter your email";
        return res.status(400).json(errors);
    }
    else {

        var reg=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email);
        if(!reg)
        {
            errors.email = "آدرس ایمیل نامعتبر است";
            errors.emailEN = "Invalid email address";
            return res.status(400).json(errors);
        }
    }

    const email = req.body.email;
    const password = req.body.password;

    userAdminModel.findOne({
        email: email,
        role: 'storeAdmin'
    })
    .then(user => {
        
        if (!user) {

            errors.email = "ادمینی با این مشخصات وجود ندارد";
            errors.emailEN = "Store admin not found";
            return res.status(404).json(errors);
        }
        
        bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {

            const payload = {
                id: user.id,
                email: user.email,
                role: user.role
            };

            let refreshToken = randtoken.uid(256);
            const newRefreshToken = new RefTok({
                refreshToken: refreshToken,
                user: user.id,
                email: user.email
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
                    
                    return res.status(200).json({
                        success: true,
                        token: "Bearer " + token,
                        refreshToken: refreshToken,
                        email: user.email
                    });
                }
            );
        } else {

            errors.password = "رمز ورود اشتباه است";
            errors.passwordEN = "Incorrect password";
            return res.status(400).json(errors);
        }
        });
    })
    .catch(err => {
        return res.status(400).json(err);
    });
});

module.exports = router;