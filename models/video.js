const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { commentSchema } = require('./comment.js')
const { likeSchema } = require('./like.js')
const { schemaOptions } = require('../constants/schemaOptions')

const VideoType = {
	SHORT: 'SHORT',
	NORMAL: 'NORMAL'
}

const videoSchema = new Schema({
	title: { type: String, required: true },
	url: { type: String, required: true },
	size: { type: Number, required: true },
	description: { type: String },
	recognition_result: { type: Schema.Types.Mixed },
	author_id: { type: Schema.Types.ObjectId, ref: 'User', default: [] },
	comments: [{ type: Schema.Types.ObjectId, ref: 'Comment', default: [] }],
	likes: [{ type: Schema.Types.ObjectId, ref: 'Like', default: [] }],
	total_likes: { type: Number, default: 0 },
	total_comments: { type: Number, default: 0 },
	total_views: { type: Number, default: 0 },
	visibility: { type: Number, default: 1 }, // 0: public, 1: private, 2: unpublic, 3: blocked
	duration: { type: Number },
	type: { type: String, enum: VideoType, default: VideoType.NORMAL },

}, schemaOptions)

module.exports = {
	Video: mongoose.model('Video', videoSchema),
	VideoType
}