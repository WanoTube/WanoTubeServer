const { isNumber } = require('lodash');
const mongoose = require('mongoose');

const Like = require('../models/like');
const Video = require('../models/video');

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
	const { id: videoId } = req.params;
	const { channelId } = req.user;

	try {
		let likeStatus = 0; //0: unlike; 1: like
		const foundVideo = await Video.findOne({ _id: videoId }).select("+likes");
		if (!foundVideo) return res.status(404).json("Cannot find video");

		if (foundVideo.likes.map(like => like.toString()).includes(channelId)) {
			foundVideo.likes = foundVideo.likes.filter(id => id.toString() !== channelId);
			foundVideo.total_likes -= 1;
			likeStatus = 0;
		}
		else {
			foundVideo.likes.push(channelId);
			foundVideo.total_likes += 1;
			likeStatus = 1;
		}

		await Video.findOneAndUpdate(
			{ _id: videoId },
			{ likes: foundVideo.likes, total_likes: foundVideo.total_likes }
		)
		res.json({ totalLikes: foundVideo.total_likes, likeStatus })
	}
	catch (err) {
		console.log(err)
		res.status(500).json("Something went wrong");
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