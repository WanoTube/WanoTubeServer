const { Video } = require('../models/video');
const { Comment } = require('../models/comment');
const mongoose = require('mongoose');

exports.getAllCommentsByVideoId = function (req, res) {
	const id = req.params.id
	Video.findById(id)
		.populate('comments')
		.exec(function (err, result) {
			if (!err) {
				if (result) res.json(result.comments)
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

exports.commentVideo = async function (req, res) {
	const body = req.body
	// const video_id = body.video_id // video_id: the video being liked
	// const userId = body.author_id // userId : the person like video
	// const content = body.content // content of the comment
	const { video_id, author_id, content } = body

	try {
		const video = await Video.findById(video_id)
		if (video) {
			addComment(author_id, video, content, function (err, comment) {
				res.json(comment);
			})
		}
	} catch (error) {
		res.json(error);
	}
}

function addComment(author_id, video, content, callback) {
	const comment = new Comment({ author_id, video_id: video.id, content })
	comment.save()
		.then(function (err) {
			video.comments.push(comment);
			video.total_comments += 1;
			video.save().then(function (err) {
				callback(err, comment)
			});
		});
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
	console.log(req.query)
	if (author_id && video_id) {
		Comment.deleteOne({ author_id, video_id }) //delete the first one it found
			.then(function (data) {
				console.log(data)
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