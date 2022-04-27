const _ = require('lodash');

const { Video } = require('../models/video');
const Account = require('../models/account')
const { deleteFile, getSignedUrl } = require('../utils/aws-s3-handlers')

const mongoose = require('mongoose');

exports.createVideoInfos = function (video) {
	return new Promise(async function (resolve, reject) {
		try {
			const videoSaved = await video.save();
			if (videoSaved) {
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
		.then(function (docs) {
			const formattedDocs = docs.map(function (doc) {
				const formmattedDoc = { ...doc._doc };
				formmattedDoc.thumbnail_url = getSignedUrl({ key: formmattedDoc.thumbnail_key });
				formmattedDoc.url = getSignedUrl({ key: formmattedDoc.url });
				delete formmattedDoc.thumbnail_key;
				return formmattedDoc;
			})
			res.json(formattedDocs)
		})
}

exports.getAllVideoInfosWithUserId = function (req, res) {
	const authId = new mongoose.mongo.ObjectId(req.params.author_id)
	Video.find({ author_id: authId })
		.then(function (docs) {
			const formattedDocs = docs.map(function (doc) {
				const formmattedDoc = { ...doc._doc };
				formmattedDoc.thumbnail_url = getSignedUrl({ key: formmattedDoc.thumbnail_key });
				formmattedDoc.url = getSignedUrl({ key: formmattedDoc.url });
				delete formmattedDoc.thumbnail_key;
				return formmattedDoc;
			})
			res.json(formattedDocs)
		})
}

exports.getAllPublicVideoInfosWithUserId = function (req, res) {
	const authId = new mongoose.mongo.ObjectId(req.params.author_id)
	Video.find({ author_id: authId, visibility: 0 })
		.then(function (docs) {
			const formattedDocs = docs.map(function (doc) {
				const formmattedDoc = { ...doc._doc };
				formmattedDoc.thumbnail_url = getSignedUrl({ key: formmattedDoc.thumbnail_key });
				formmattedDoc.url = getSignedUrl({ key: formmattedDoc.url });
				delete formmattedDoc.thumbnail_key;
				return formmattedDoc;
			})
			res.json(formattedDocs)
		})
}

exports.getAllPublicVideoInfos = function (req, res) {
	Video.find({ visibility: 0 })
		.then(function (docs) {
			const formattedDocs = docs.map(function (doc) {
				const formmattedDoc = { ...doc._doc };
				formmattedDoc.thumbnail_url = getSignedUrl({ key: formmattedDoc.thumbnail_key });
				formmattedDoc.url = getSignedUrl({ key: formmattedDoc.url });
				delete formmattedDoc.thumbnail_key;
				return formmattedDoc;
			})
			res.json(formattedDocs)
		})
}

exports.getVideoInfoById = function (req, res) {
	const id = req.params.id
	Video.findById(id)
		.then(function (doc) {
			const formmattedDoc = { ...doc._doc };
			formmattedDoc.thumbnail_url = getSignedUrl({ key: formmattedDoc.thumbnail_key });
			formmattedDoc.url = getSignedUrl({ key: formmattedDoc.url });
			delete formmattedDoc.thumbnail_key;
			res.json(formmattedDoc);
		})
};

exports.search = function (req, res) {
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
	const { title, description, url, size, privacy, duration } = req.body;
	try {
		const video = await Video.updateOne({ _id: body.id }, {
			title,
			description,
			url,
			size,
			duration,
			visibility: privacy
		});
		res.json(video);
	} catch (error) {
		res.status(500).json(error);
	}
}

exports.increaseView = async function (req, res) {
	const { _id: viewerId } = req.user;
	const { id: videoId } = req.params

	try {
		const video = await Video.findOneAndUpdate(
			{ _id: videoId },
			{ $addToSet: { views: viewerId } },
			{ new: true }
		);

		await Account.findOneAndUpdate(
			{ user_id: viewerId },
			{ $addToSet: { watched_history: videoId } },
			{ new: true }
		)

		res.json({ video });
	}
	catch (error) {
		res.status(500).json(error);
	}
}

exports.deleteVideoInfo = async function (req, res) {
	const { id, url } = req.body
	try {
		await deleteFile(url)

	} catch (error) {
		throw error
	}
	try {
		const data = await Video.deleteOne({ _id: id });
		res.status(200).json(data);
	} catch (error) {
		res.status(500).json(error);
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
		res.status(500).json(error);
	}
}

exports.getWatchHistory = async function (req, res) {
	const { _id: userId } = req.user;

	try {
		const account = await Account.findOne({ user_id: userId }).populate({
			path: 'watched_history',
			populate: 'author_id'
		});

		const watchedHistory = account.watched_history.map(function (doc) {
			const formmattedDoc = { ...doc._doc };
			formmattedDoc.thumbnail_url = getSignedUrl({ key: formmattedDoc.thumbnail_key });
			formmattedDoc.url = getSignedUrl({ key: formmattedDoc.url });
			delete formmattedDoc.thumbnail_key;
			return formmattedDoc;
		})

		const watchedHistoryByWeek = _.groupBy(watchedHistory, (d) => new Date(d.created_at));
		res.status(200).json({ watchedHistory: watchedHistoryByWeek });
	}
	catch (error) {
		console.log(error)
		res.status(500).json(error);
	}
}