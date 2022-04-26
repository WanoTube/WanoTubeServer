const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { schemaOptions } = require('../constants/schemaOptions');

const defaultThumbnail = "https://unica.vn/upload/landingpage/045402_toi-uu-kich-thuoc-thumbnail-youtube-nhanh-gon-voi-vai-cu-click-chuot_thumb.jpg";
const VideoType = {
	SHORT: 'SHORT',
	NORMAL: 'NORMAL'
};

const videoSchema = new Schema({
	title: { type: String, required: true },
	url: { type: String, required: true },
	thumbnail_key: { type: String, default: defaultThumbnail },
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

}, schemaOptions);

module.exports = {
	Video: mongoose.model('Video', videoSchema),
	VideoType
};