const mongoose = require('mongoose');
const Schema = mongoose.Schema

const { schemaOptions } = require('../constants/schemaOptions')

const CommentSchema = new Schema({
	content: { type: String, required: true, default: '' },
	author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	video_id: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
	is_reply: { type: Boolean, default: false },
	replies: [{ type: Schema.Types.ObjectId, ref: 'Comment', required: true }],
	deleted_by: { type: Schema.Types.ObjectId, ref: 'Account', default: null },
	deleted_at: { type: Date }
}, schemaOptions);

module.exports = mongoose.model('Comment', CommentSchema);
