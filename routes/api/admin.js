const adminModel = require('./../../models/userAdmin');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const signToken = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            'secret',
            {
                //expiresIn: 3600 * 336
            }, (error, token) => {
                if (error) {
                    reject(error);
                }
                resolve(token);
            }
        )
    });
    
}

const promisify = fn => (...args) => {
    return new Promise((resolve, reject) => {
        fn(...args, (err, data) => err ? reject(err) : resolve(data))
    })
}

router
    .route('/insert')
    .post(async (req, res) => {
        try{
            let admin = await adminModel.findOne({
                username: req.body.username,
                role: req.body.role
            })
            .exec();

            const promisified_genSalt = promisify(bcrypt.genSalt);
            const salt = await promisified_genSalt(10);
            const promosified_hash = promisify(bcrypt.hash);
            const hashedPassword = await promosified_hash(req.body.password, salt)
            
            if(admin){
                admin.password = hashedPassword
                admin.role = req.body.role;

                await admin.save();
            }else{
                admin = new adminModel({
                    username: req.body.username,
                    password: hashedPassword,
                    role: req.body.role
                });

                await admin.save();
            }

            
            return res.status(200).json(admin);
        }catch(err) {
            return res.status(400).json('خطای سرور')
        }
    })

router
    .route('/login')
    .post(async (req, res) => {
        const admin = await adminModel.findOne({ username: req.body.username, role: { $in: req.body.roles } }).lean();
        if (admin) {
            bcrypt.compare(req.body.password, admin.password).then(async (isMatched) => {
                if (!isMatched) {
                    return res.status(404).json('ادمینی با این مشخصات یافت نشد');
                }
                const token = await signToken({
                    payloadType: 'connectedAdminLogin',
                    username: admin.username,
                    role: admin.role
                });

                return res.status(200).json({token, role: admin.role});
            })
        } else {
            return res.status(404).json('ادمینی با این مشخصات یافت نشد');
        }
    });

router
    .route('/:role/:username')
    .get(async (req, res) => res.status(200).json(await adminModel.findOne({role: req.params.role, username: req.params.username})));

module.exports = router;
