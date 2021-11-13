const mongoose = require('mongoose');
const Schema = mongoose.Schema
const schemaOptions = {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const Comment = new Schema ({
    content: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    videoId: { type: Schema.Types.ObjectId, ref: "Video", required: true },
}, schemaOptions);

module.exports.commentSchema = Comment
module.exports.Comment = mongoose.model('Comment', Comment)