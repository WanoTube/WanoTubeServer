const mongoose = require('mongoose');
const Schema = mongoose.Schema
const schemaOptions = {
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const CommentSchema = new Schema({
	content: { type: String, required: true },
	author_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
	video_id: { type: Schema.Types.ObjectId, ref: "Video", required: true },
}, schemaOptions);

module.exports.commentSchema = CommentSchema
module.exports.Comment = mongoose.model('Comment', CommentSchema)