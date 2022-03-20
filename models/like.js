const mongoose = require('mongoose');
const Schema = mongoose.Schema

const { schemaOptions } = require('../constants/schemaOptions')

const likeSchema = new Schema({
	author_id: { type: Schema.Types.ObjectId, ref: 'User' },
	target_id: { type: Schema.Types.ObjectId, ref: 'Video' }, //postId or commentId.
}, schemaOptions);

//Some points you need to consider:

// 1.Store likes of posts in post collection
// 2.Store likes of comments in comments collection
// 3.You need to build a mechanism to calculate likes and store in that collection

module.exports.likeSchema = likeSchema
module.exports.Like = mongoose.model('Like', likeSchema)