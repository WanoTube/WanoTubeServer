const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const User = require('../models/user');
const Account = require('../models/account');
const { registerValidator } = require('../validations/auth');
const { uploadFile, getFileStream } = require('../utils/aws-s3-handlers');
const { restrictImageName } = require('../utils/image-handlers');
const { BlockedStatus } = require('../constants/user');

exports.createUser = async function (request, response) {
	const { error } = registerValidator(request.body);
	if (error) return response.json(error);

	const checkEmailExist = await Account.findOne({ email: request.body.email });
	if (checkEmailExist) return response.status(422).json('Email is exist');

	const usernameExist = await Account.findOne({ username: request.body.username });
	if (usernameExist) return response.status(422).json('Username is exist');

	const salt = await bcrypt.genSalt(10);
	const hashPassword = await bcrypt.hash(request.body.password, salt);
	const user = new User({
		first_name: request.body.first_name,
		last_name: request.body.last_name,
		phone_number: request.body.phone_number,
		birth_date: request.body.birth_date
	});

	const account = new Account({
		username: request.body.username,
		email: request.body.email,
		password: hashPassword,
	});
	account.user_id = user._id;

	try {
		const { username, is_admin } = account
		await account.save();
		const newUser = await user.save();
		const token = jwt.sign({ _id: user._id, channelId: account._id }, process.env.TOKEN_SECRET, { expiresIn: 60 * 60 * 24 * 60 }); //outdated in 60 days
		const result = {
			token: token,
			user: {
				_id: newUser._id,
				username,
				is_admin,
				channelId: account._id,
				is_blocked: account.blocked_status !== BlockedStatus.NONE
			}
		}
		response.header('auth-token', token).json(result);
	} catch (err) {
		response.status(500).json(err);
	}
};

exports.login = async function (request, response) {
	const account = await Account.findOne({ email: request.body.email }).select('+password');
	if (!account) return response.status(422).json('Email does not exist!');
	const checkPassword = await bcrypt.compare(request.body.password, account.password);
	if (!checkPassword) return response.status(422).json('Password is not correct!');
	try {
		const user = await User.findOne({ _id: account.user_id });
		if (user) {
			const token = jwt.sign({ _id: user._id, channelId: account._id }, process.env.TOKEN_SECRET, { expiresIn: 60 * 60 * 24 * 60 }); //outdated in 60 days
			const result = {
				token: token,
				user: {
					_id: user._id,
					username: account.username,
					is_admin: account.is_admin,
					avatar: user.avatar,
					channelId: account._id,
					is_blocked: account.blocked_status !== BlockedStatus.NONE
				}
			}
			response.header('auth-token', token).json(result);
		} else {
			response.status(400).json("Email does not exist!");
		}
	} catch (error) {
		console.log(error);
		response.status(500).json(error);
	}
}

exports.getAllUsers = async function (req, res) {
	try {
		const users = await User.find({});
		const results = [];

		for (eachUser of users) {
			const { _id, first_name, last_name, gender, birth_date, avatar, phone_number, country } = eachUser
			const user = { _id, first_name, last_name, gender, birth_date, avatar, phone_number, country }
			try {
				const account = await Account.findOne({ user_id: user._id });
				if (account) {
					user.username = account.username;
					user.email = account.email;
					user.is_admin = account.is_admin;
				}
				results.push(user);
			} catch (error) {
				res.json(error);
			}
		}
		if (results) {
			res.json(results);
		} else {
			res.json("Cannot find any user")
		}
	} catch (error) {
		res.json(error);
	}
};

exports.getUserById = async function (req, res) {
	console.log("getUserById")
	const userId = new mongoose.mongo.ObjectId(req.params.id)
	try {
		const user = await User.findById(userId);
		try {
			const account = await Account.findOne({ user_id: user._id });
			const result = {
				user: user,
				channel_id: account._id,
				username: account.username
			}
			res.json(result);
		} catch (error) {
			res.json(error);
		}
	} catch (error) {
		res.json(error);
	}
};

exports.getAccountByUserId = function (req, res) {
	console.log("getAccountByUserId")
	const userId = new mongoose.mongo.ObjectId(req.params.user_id)
	Account.find({ user_id: userId }).exec(function (err, account) {
		if (err) {
			res.json(400, err);
		} else {
			res.json(account);
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
	} catch (error) {
		res.json(error);
	}
};

exports.updateAvatar = async function (req, res) {
	const body = req.body;
	const file = req.files.avatar;
	const fileName = file.name;
	const dataBuffers = file.data;
	const { ext } = path.parse(fileName);
	const avatarName = restrictImageName(fileName, body.user_id) + ext;
	try {
		const uploaded = await uploadToS3(avatarName, dataBuffers, req.app);
		await updateAvatarInDB(body.user_id, avatarName);
		// TO-DO: Remove older image?
		if (uploaded)
			res.json(avatarName);
	} catch (error) {
		res.json(error);
	}
}

function updateAvatarInDB(userId, avatarName) {
	return new Promise(async function (resolve, reject) {
		try {
			const user = await User.updateOne({ _id: userId }, { avatar: avatarName });
			resolve(user);
		} catch (error) {
			reject(error);
		}
	});
}

function uploadToS3(fileName, fileStream, app) {
	const io = app.get('socketio');
	return new Promise(function (resolve, reject) {
		try {
			if (fileName) {
				// Save to AWS
				uploadFile(fileName, fileStream)
					.on('httpUploadProgress', function (progress) {
						const progressPercentage = Math.round(progress.loaded / progress.total * 100);
						io.emit('Upload avatar image to S3', progressPercentage);
						if (progressPercentage >= 100)
							resolve(fileName);
					});
			}
		} catch (error) {
			reject(error)
		}
	});
}

exports.updateUser = async function (req, res) {
	const body = req.body
	const { id, first_name, last_name, gender, birth_date, phone_number, description, country } = body;
	if (email) {
		try {
			const checkEmailExist = await Account.findOne({ email: email });
			if (checkEmailExist) res.status(422).json('Email is exist');
			else await Account.updateOne({ user_id: id }, { email: email });
		} catch (error) {
			res.json(error);
		}
	}
	if (body && id) {
		try {
			const user = await User.updateOne({ _id: id }, {
				first_name: first_name,
				last_name: last_name,
				gender: gender,
				birth_date: birth_date,
				phone_number: phone_number,
				description: description,
				country: country
			});
			res.json(user);
		} catch (error) {
			res.status(500).json(error);
		}
	}
}

exports.getCopyrightStatus = async function (req, res) {
	console.log("getCopyrightStatus");
	const { channelId } = req.user;
	const { blocked_status, strikes } = await Account.findById(channelId).populate("blocked_status").populate("strikes");
	res.json({
		blocked_status, strikes
	});
}

exports.getFollowInfo = async function (req, res) {
	const { channelId } = req.user;
	try {
		const { number_of_followers, followings } = await Account.findOne({ _id: channelId }).select("+followings");
		res.json({ number_of_followers, followings });
	}
	catch (error) {
		console.log(error)
		res.status(500).json(error);
	}
}

exports.getFollowingChannels = async function (req, res) {
	const { channelId } = req.user;
	try {
		const { followings, user_id } = await Account.findOne({ _id: channelId }).select("+followings").populate('followings user_id');
		res.json({
			followingChannels: followings.map(channel => ({
				username: channel.username,
				channelId: channel._id,
				numberOfFollowers: channel.number_of_followers,
				avatar: user_id.avatar
			}))
		});
	}
	catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
}