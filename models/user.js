const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { schemaOptions } = require('../constants/schemaOptions')

const userSchema = new Schema({
	first_name: { type: String },
	last_name: { type: String },
	gender: { type: String, default: 'Female' },
	birth_date: { type: Date },
	phone_number: { type: String },
	country: { type: String },
	avatar: { type: String, default: "https://api-private.atlassian.com/users/8f525203adb5093c5954b43a5b6420c2/avatar" },
	description: { type: String }
}, schemaOptions);

module.exports = mongoose.model('User', userSchema)
module.exports.userSchema = userSchema