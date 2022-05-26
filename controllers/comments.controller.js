const mongoose = require('mongoose');

const Video = require('../models/video');
const Comment = require('../models/comment');
const Account = require('../models/account');

exports.getAllCommentsByVideoId = async function (req, res) {
	const { id } = req.params;
	const video = await Video.findOne(
		{ _id: id }
	).populate({
		path: 'comments',
		select: 'is_reply replies user content created_at video_id author_id deleted_by',
		match: { is_reply: false, deleted_by: null },
	});
	const { comments } = video._doc;
	comments.sort((a, b) => b.created_at - a.created_at);
	const commentsWithoutReplies = comments.map(comment => {
		const commentDoc = ({ ...comment })._doc;
		commentDoc.number_of_replies = commentDoc.replies.length;
		delete commentDoc.replies;
		return commentDoc;
	});
	res.json(commentsWithoutReplies);
};

exports.getCommentReplies = async function (req, res) {
	const { id } = req.params;
	try {
		const mainComment = await Comment.findOne({ _id: id }).populate({
			path: 'replies',
			match: { deleted_by: null },
			populate: {
				path: 'author_id',
				select: 'avatar',
			}
		});
		const replies = await Promise.all(mainComment.replies.map(async (reply) => {
			const channel = await Account.findOne({ user_id: reply.author_id });
			const replyDoc = reply._doc;
			replyDoc.user = { ...replyDoc.author_id._doc, username: channel._doc.username };
			delete replyDoc.author_id;
			delete replyDoc.replies;
			return replyDoc;
		}));
		replies.sort((a, b) => b.created_at - a.created_at);
		res.json(replies);
	}
	catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
}

exports.getTotalCommentsByVideoId = async function (req, res) {
	const id = req.params.id
	try {
		const video = await Video.findById(id)
		res.status(200).json(JSON.stringify(video.total_comments));
	} catch (error) {
		res.json(error);
	}
};

exports.addComment = async function (req, res) {
	const { _id: author_id } = req.user;
	const { video_id, content, reply_to = null } = req.body;

	try {
		const video = await Video.findOne({ _id: video_id }).select("+comments");
		if (!video) return res.status(400).json({
			message: "Video does not exist!"
		});

		const newComment = await Comment.create({ author_id, video_id: video._id, content, is_reply: !!reply_to });
		video.comments.push(newComment);
		video.total_comments += 1;
		await video.save();

		if (!!reply_to) {
			await Comment.findOneAndUpdate(
				{ _id: reply_to },
				{ $push: { replies: newComment._id } }
			);
		}

		const account = await Account.findOne({ user_id: author_id });
		const commentDoc = { ...newComment._doc, user: account };
		delete commentDoc.author_id;

		res.json(commentDoc);
	} catch (error) {
		res.json(error);
	}
}

exports.removeComment = async function (req, res, next) {
	const { _id, channelId } = req.user;
	const { id: commentId } = req.params;

	try {
		const comment = await Comment.findById(commentId);
		if (!comment) return res.status(400).json({
			message: "Comment cannot be found"
		});

		const canRemoveComment = await _canRemoveComment(comment, _id);
		if (!canRemoveComment) return res.status(403).json({
			message: "You are not allow to remove this comment"
		});

		const removedComment = await Comment.findOneAndUpdate(
			{ _id: commentId },
			{ deleted_by: channelId, deleted_at: new Date(Date.now()) }
		);

		res.json({
			removedComment: removedComment._id
		});
	}
	catch (err) {
		next(err);
	}
}

const _canRemoveComment = async function (comment, removerId) { //userId
	if (comment.author_id.toString() == removerId) return true;

	const video = await Video.findById(comment.video_id);
	if (video.author_id.toString() == removerId) return true;

	return false;
}