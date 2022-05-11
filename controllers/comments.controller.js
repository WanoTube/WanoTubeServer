const Video = require('../models/video');
const Comment = require('../models/comment');
const Account = require("../models/account");
const mongoose = require('mongoose');

exports.getAllCommentsByVideoId = function (req, res) {
	const id = req.params.id
	Video.findById(id)
		.populate('comments')
		.exec(function (err, result) {
			const comments = result.comments;
			comments.sort((a, b) => b.created_at - a.created_at);
			if (!err) {
				if (result) res.json(comments)
				else res.json("Cannot find video")
			} else
				res.json(err)
		})
};

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
	const { video_id, content } = req.body;

	try {
		const video = await Video.findOne({ _id: video_id }).select("+comments");
		if (!video) return res.status(400).json({
			message: "Video does not exist!"
		});
		const newComment = await Comment.create({ author_id, video_id: video._id, content });
		video.comments.push(newComment);
		video.total_comments += 1;
		await video.save();

		const account = await Account.findOne({ user_id: author_id });
		const commentDoc = { ...newComment._doc, user: account };
		delete commentDoc.author_id;
		res.json(commentDoc);
	} catch (error) {
		res.json(error);
	}
}

exports.deleteCommentFromVideo = function (req, res) {
	const body = req.body
	const author_id = body.author_id
	const video_id = body.video_id
	Video.findById(video_id)
		.exec(function (err, video) {
			if (video && !err) {
				if (video.comments.length <= 0) {
					removeCommentFromVideo(author_id, video, function (result) {
						res.json(result)
					})
				}
			} else {
				if (err) res.json(err)
				else res.json("Video not found")
			}
		})
}

function removeCommentFromVideo(author_id, video, callback) {
	Video.findByIdAndUpdate(video.id, {
		$pull: {
			comments: { author_id }
		}
	}, function () {
		Comment.deleteOne({ author_id, video_id: video.id }, callback(result))
	})
}

exports.deleteCommentInfo = function (req, res) {
	const author_id = new mongoose.mongo.ObjectId(req.query.author_id)
	const video_id = new mongoose.mongo.ObjectId(req.query.video_id)
	if (author_id && video_id) {
		Comment.deleteOne({ author_id, video_id }) //delete the first one it found
			.then(function (data) {
				res.status(200).json(data)
			})
	} else {
		res.json("author_id and video_id is invalid")
	}
}

exports.deleteCommentInfoById = function (req, res) {
	const id = req.params.id
	if (id) {
		Comment.deleteOne({ id: id }) //delete the first one it found
			.then(function (data) {
				console.log(data)
				res.status(200).json(data)
			})
	} else {
		res.json("author_id and video_id is invalid")
	}
}