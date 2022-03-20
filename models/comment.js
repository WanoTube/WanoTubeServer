const mongoose = require('mongoose');
const Schema = mongoose.Schema

const { schemaOptions } = require('../constants/schemaOptions')

const commentSchema = new Schema({
	content: { type: String, required: true },
	author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	video_id: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
}, schemaOptions);

const Comment = mongoose.model('Comment', commentSchema)

module.exports = {
	commentSchema,
	Comment
}