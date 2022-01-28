const { Video } = require('../models/video');
const { deleteFile } = require('../utils/aws-s3-handlers')

const mongoose = require('mongoose');

exports.createVideoInfos = function (video) {
	return new Promise(async function (resolve, reject) {
		try {
			const videoSaved = await video.save();
			if (videoSaved) {
				console.log(video);
				resolve(video);
			} else {
				throw new Error('Cannot save video')
			}
		} catch (error) {
			reject(error);
		}
	});
}

exports.getAllVideoInfos = function (req, res) {
	Video.find()
		.then(function (doc) {
			res.json(doc)
		})
}

exports.getAllVideoInfosWithUserId = function (req, res) {
	const authId = new mongoose.mongo.ObjectId(req.params.author_id)
	Video.find({ author_id: authId })
		.then(function (doc) {
			res.json(doc)
		})
}

exports.getAllPublicVideoInfosWithUserId = function (req, res) {
	const authId = new mongoose.mongo.ObjectId(req.params.author_id)
	Video.find({ author_id: authId, visibility: 0 })
		.then(function (doc) {
			res.json(doc)
		})
}

exports.getAllPublicVideoInfos = function (req, res) {
	Video.find({ visibility: 0 })
		.then(function (doc) {
			res.json(doc)
		})
}

exports.getVideoInfoById = function (req, res) {
	const id = req.params.id
	Video.findById(id)
		.exec(function (err, result) {
			if (!err)
				res.json(result)
			else
				res.json(err)
		})
};

exports.search = function (req, res) {
	console.log("Searching..")
	const searchKey = req.query.search_query
	// TO-DO: SEARCH IN TITLE, not whole title
	Video.
		find({
			title: searchKey,
		})
		.exec(function (err, result) {
			if (!err)
				res.json(result)
			else
				res.json(err)
		})
};

exports.updateVideoInfo = async function (req, res) {
	const body = req.body
	try {
		const video = await Video.updateOne({ _id: body.id }, {
			total_views: body.totalViews,
			title: body.title,
			description: body.description,
			url: body.url,
			size: body.size,
			visibility: body.privacy,
			duration: body.duration
		});
		res.json(video);
	} catch (error) {
		res.json(error);
	}
}

exports.deleteVideoInfo = async function (req, res) {
	const id = req.body.id
	const url = req.body.url
	console.log(req.body)
	try {
		await deleteFile(url)

	} catch (error) {
		console.log(error)
	}
	try {
		const data = await Video.deleteOne({ _id: id });
		res.status(200).json(data);
	} catch (error) {
		res.json(error);
	}
}

exports.getTotalViewsByVideoId = async function (req, res) {
	const id = req.params.id
	try {
		const video = await Video.findById(id);
		if (video) {
			res.status(200).json(JSON.stringify(video.total_views));
		}
	} catch (error) {
		res.status(400).json(error);
	}
}