const mongoose = require("mongoose");
const Schema = mongoose.Schema
const schemaOptions = {
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};
const Account = new mongoose.Schema({
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
	user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, schemaOptions);

module.exports = mongoose.model('Account', Account)