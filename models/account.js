const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { schemaOptions } = require('../constants/schemaOptions')

//Channel Schema
const Account = new Schema({
	username: {
		type: String,
		required: true,
		min: 6,
		max: 255
	},
	email: {
		type: String,
		required: true,
		min: 6,
		max: 225
	},
	password: {
		type: String,
		required: true,
		min: 6,
		max: 255
	},
	is_admin: { type: Boolean, default: false },
	user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	followers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
	followings: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
	watched_history: [{ type: Schema.Types.ObjectId, ref: 'Video', default: [] }],
}, schemaOptions)

module.exports = mongoose.model('Account', Account)