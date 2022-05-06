const Like = require('../models/like');
const Video = require('../models/video');
const mongoose = require('mongoose');

exports.getAllLikes = function (req, res) {
	Like.find()
		.then(function (doc) {
			res.json(doc)
		})
}

exports.getAllLikesByVideoId = function (req, res) {
	const id = req.params.id
	console.log(id)
	Video.findById(id)
		.exec(function (err, result) {
			if (!err) {
				if (result) res.json(result.likes)
				else res.json("Cannot find video")
			} else {
				res.json(err)
			}

		})
};

exports.getTotalLikesByVideoId = async function (req, res) {
	const id = req.params.id
	try {
		const video = await Video.findById(id);
		if (video) {
			res.status(200).json(JSON.stringify(video.total_likes));
		}
	} catch (error) {
		res.status(400).json(error);
	}
};

exports.likeVideo = async function (req, res) {
	const body = req.body
	const video_id = body.target_id // video_id: the video being liked
	const userId = body.author_id // userId : the person like video

	try {
		const updatedVideo = await Video.findById(video_id);
		if (!updatedVideo) return res.status(404).json("Cannot find video");

		if (updatedVideo.total_likes <= 0) {
			updatedVideo.total_likes += 1;
		}
		else {
			updatedVideo.total_likes -= 1;
		}
		await updatedVideo.save();
		res.json({})
	}
	catch (err) {
		res.status(500).json("Somethin went wrong");
	}
}

exports.deleteLikeInfoById = function (req, res) {
	const id = req.params.id
	console.log(id)
	Like.deleteOne({ id: id })
		.then(function (data) {
			res.status(200).json(data)
		})
}

exports.deleteLikeInfo = function (req, res) {
	const author_id = new mongoose.mongo.ObjectId(req.query.author_id)
	const target_id = new mongoose.mongo.ObjectId(req.query.target_id)

	if (author_id && target_id) {
		Like.deleteOne({ author_id: author_id, target_id: target_id }) //delete the first one it found
			.then(function (data) {
				res.status(200).json(data)
			})
	} else {
		res.json("author_id and target_id is invalid")
	}
}