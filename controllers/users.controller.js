const User = require('../models/user');
const Account = require('../models/account');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { registerValidator } = require('../validations/auth');
const { uploadFile, getFileStream } = require('../utils/aws-s3-handlers');
const account = require('../models/account');
const mongoose = require('mongoose');
const { restrictImageName } = require('../utils/image-handlers')
const path = require('path');

exports.createUser = async function (request, response) {
    const { error } = registerValidator(request.body);

    if (error) return response.send(error);

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
            "user": {
                "_id": newUser._id,
                "username": account.username,
                "is_admin": account.is_admin
            }
        }
        response.header('auth-token', token).send(result);
    } catch (err) {
        response.status(400).send(err);
    }
};

exports.login = async function (request, response) {
    const account = await Account.findOne({email: request.body.email});
    if (!account) return response.status(422).send('Email is not correct');
    const checkPassword = await bcrypt.compare(request.body.password, account.password);
    if (!checkPassword) return response.status(422).send('Password is not correct');
    try {
        let user = await User.findOne({_id: account.user_id});
        if (user) {
            const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET, { expiresIn: 60 * 60 * 24 }); //outdated in 1 day
            const result = {
                "token": token,
                "user": {
                    "_id": user._id,
                    "username": account.username,
                    "is_admin": account.is_admin
                }
            }
            response.header('auth-token', token).send(result);
        } else {
            response.status(400).send("Cannot find user");
        }
    } catch (error) {
        response.status(400).send(err);
    }
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

exports.getUserById = function (req, res) {
    const userId = new mongoose.mongo.ObjectId(req.params.id)
    User.findById(userId).exec(function (err, user) {
        if (err) {
            res.send(400, err);
        } else {
            res.send(user);
        }
    });
};

exports.getAccountByUserId = function (req, res) {
    const userId = new mongoose.mongo.ObjectId(req.params.user_id)
    Account.find({user_id: userId}).exec(function (err, account) {
        if (err) {
            res.send(400, err);
        } else {
            res.send(account);
        }
    });
};

exports.getUserByUsername = function (req, res) {
    const username = req.params.username
    Account.find({username: username}).exec(function (err, account) {
        if (err) {
            res.status(400).send(err);
        } else {
            if (account) {
                const userId =  account[0].user_id;
                User.findById(userId).exec(function (error, user) {
                    if (err) {
                        res.status(400).send(error);
                    } else {
                        res.status(200).send(user);
                    }
                })
            } else {
                res.send(400, "Cannot find account")
            }
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

exports.updateAvatar = async function (req, res) {
    const body = req.body;
    const file = req.files.avatar;
    const fileName = file.name;
    const dataBuffers = file.data;
    let { ext } = path.parse(fileName);
    const avatarName = restrictImageName(fileName, body.user_id) + ext;
    try {
        await uploadToS3(avatarName, dataBuffers, req.app);
        const saveDBResult = await updateAvatarInDB(body.user_id, avatarName);
        res.send(saveDBResult);
        // TO-DO: Remove older image?
    } catch (error) {
        res.send(error);
    }
}

function updateAvatarInDB (userId, avatarName) {
    return new Promise(async function(resolve, reject) {
        try {
            return await User.updateOne({ _id: userId }, { avatar: avatarName });
        } catch (error) {
            reject(error);
        }
    });
}

function uploadToS3 (fileName, fileStream, app) {
    const io = app.get('socketio');
    return new Promise(function(resolve, reject) {
        try {
            if (fileName) {
                // Save to AWS
                uploadFile(fileName, fileStream)
                .on('httpUploadProgress', function(progress) {
                    let progressPercentage = Math.round(progress.loaded / progress.total * 100);
                    io.emit('Upload avatar image to S3', progressPercentage);
                  });
                resolve(fileName);
            }
        } catch (error) {
            reject(error)
        }
    });
}

exports.updateUser = async function (req, res) {
    const body = req.body
    const id = body.id;
    if (body.email) {
        try {
           await  Account.updateOne({user_id: id}, {email: body.email});
        } catch (error) {
            res.send(error);
        }
    }
    if (body && id) {
        try {
            const user = await User.updateOne({_id: id}, {
                first_name: body.first_name,
                last_name: body.last_name,
                gender: body.gender,
                birth_date: body.birth_date,
                phone_number: body.phone_number,
                description: body.description,
                country: body.country
            });
            res.send(user);
        } catch (error) {
            res.send(error);
        }
    }
}