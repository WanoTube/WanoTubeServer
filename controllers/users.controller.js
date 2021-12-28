const User = require('../models/user');
const Account = require('../models/account');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { registerValidator } = require('../validations/auth');
const { uploadFile, getFileStream } = require('../utils/aws-s3-handlers')

exports.createUser = async function (request, response) {
    const { error } = registerValidator(request.body);

    if (error) return response.send(registerValidator(request.body));

    const checkEmailExist = await Account.findOne({ email: request.body.email });

    if (checkEmailExist) return response.status(422).send('Email is exist');

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(request.body.password, salt);

    const user = new User({
        first_name: request.body.first_name,
        last_name: request.body.last_name,
        phone_number: request.body.phone_number,
        birth_date: request.body.birth_date
    });
    let account = new Account({
        username: request.body.username,
        email: request.body.email,
        password: hashPassword,
    });
        account.user_id = user._id;
    try {
        const newAccount = await account.save();
        console.log(newAccount)
        const newUser = await user.save();

        const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET, { expiresIn: 60 * 60 * 24 }); //outdated in 1 day
        const result = {
            "token": token,
            "user": newUser
        }
        response.header('auth-token', token).send(result);
    } catch (err) {
        response.status(400).send(err);
    }
};

exports.login = async function (request, response) {
    //TO-DO: Check role admin or user?
    const account = await Account.findOne({email: request.body.email});
    if (!account) return response.status(422).send('Email is not correct');
    const checkPassword = await bcrypt.compare(request.body.password, account.password);

    if (!checkPassword) return response.status(422).send('Password is not correct');
    
    console.log("account: ", account);
    const user = await Account.findOne({_id: account._id});
    console.log("user: ", user);
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET, { expiresIn: 60 * 60 * 24 }); //outdated in 1 day
    const result = {
        "token": token,
        "user": user
    }
    response.header('auth-token', token).send(result);
}

exports.getAllUsers = function (req, res) {
    User.find({}).exec(function (err, users) {
        if (err) {
            res.send(400, err);
        } else {
            res.send(users);
        }
    });
};

exports.getAvatar = async function (req, res) {
    const key = req.params.key;
    try {
        const readStream = await getFileStream(key)
        if (readStream) {
            readStream.pipe(res);
        }
    } catch(error) {
        res.send(error);
    }
};