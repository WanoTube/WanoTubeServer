const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { schemaOptions } = require('../constants/schemaOptions');

const MAX_ALLOWED_STRIKES = 3;

//Channel Schema
const AccountSchema = new Schema({
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
		select: false,
		required: true,
		min: 6,
		max: 255
	},
	is_admin: { type: Boolean, default: false },
	user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	followers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
	followings: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
	members: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
	blocked_accounts: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
	watched_history: [{ type: Schema.Types.ObjectId, ref: 'WatchHistoryDate', default: [] }],
	strikes: { type: [Schema.Types.ObjectId], ref: 'Strike', default: [], select: false },
	is_blocked: { type: Boolean, default: false }
}, schemaOptions);

AccountSchema.post("findOneAndUpdate", function (data) {
	if (!data) return;
	// if (data.strikes && data.strikes.length >= MAX_ALLOWED_STRIKES) data.is_blocked = true;
	data.save()
})

module.exports = mongoose.model('Account', AccountSchema);