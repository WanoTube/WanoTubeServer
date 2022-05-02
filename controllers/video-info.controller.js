const _ = require('lodash');

const { Video } = require('../models/video');
const User = require('../models/user');
const Account = require('../models/account');
const WatchHistoryDate = require('../models/watchHistoryDate');
const { getSignedUrl } = require('../utils/aws-s3-handlers');

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

			res.json({ videos: formattedDocs });
		})
}

exports.getVideoInfoById = async function (req, res) {
	const { id } = req.params;
	const video = await Video.findById(id);
	const formmattedDoc = { ...video._doc };
	formmattedDoc.thumbnail_url = getSignedUrl({ key: formmattedDoc.thumbnail_key });
	formmattedDoc.url = getSignedUrl({ key: formmattedDoc.url });
	delete formmattedDoc.thumbnail_key;

	const channelAccount = await Account.findOne({ user_id: video.author_id }).populate("user_id");
	formmattedDoc.user = { ...channelAccount, avatar: channelAccount.user_id.avatar, username: channelAccount.username };
	delete formmattedDoc.author_id;

	res.json({ video: formmattedDoc });
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
				res.json(result);
			else
				res.json(err);
		})
};

exports.updateVideoInfo = async function (req, res) {
	const { title, description, url, size, privacy, duration } = req.body;
	try {
		const video = await Video.updateOne({ _id: req.body.id }, {
			title,
			description,
			url,
			size,
			duration,
			visibility: privacy
		});
		res.json(video);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
}

exports.deleteVideoInfo = async function (req, res) {
	const { id, url } = req.body
	try {
		const data = await Video.deleteOne({ _id: id });
		res.status(200).json(data);
	} catch (error) {
		res.status(500).json(error);
	}
}

exports.getTotalViewsByVideoId = async function (req, res) {
	const { id } = req.params;
	try {
		const video = await Video.findById(id);
		if (video) {
			res.status(200).json(JSON.stringify(video.total_views));
		}
	} catch (error) {
		res.status(500).json(error);
	}
}

exports.increaseView = async function (req, res) {
	const { _id: viewerId } = req.user;
	const { id: videoId } = req.params
	const today = new Date(Date.now())
	const formattedToday = `${today.getDate()}/${today.getMonth()}/${today.getFullYear()}`

	try {
		const foundAccount = await Account.findOne(
			{ user_id: viewerId }
		);

		const foundWatchHistoryDate = await WatchHistoryDate.findOne(
			{ account_id: foundAccount._id, date: formattedToday }
		)

		if (!foundWatchHistoryDate) {
			const newWatchHistoryDate = await WatchHistoryDate.create({
				account_id: foundAccount._id, date: formattedToday, videos: [videoId]
			});
			await Account.updateOne(
				{ _id: foundAccount._id },
				{ $addToSet: { watched_history: newWatchHistoryDate } },
				{ new: true }
			);
			res.status(200).json({ watchHistoryDate: newWatchHistoryDate });
		}
		else {
			const updatedWatchHistoryDate = await WatchHistoryDate.updateOne(
				{ account_id: foundAccount._id, date: formattedToday },
				{ $addToSet: { videos: videoId } }
			)
			res.status(200).json({ watchHistoryDate: updatedWatchHistoryDate })
		}
		await Video.updateOne(
			{ _id: videoId },
			{ $inc: { total_views: 1 } },
			{ new: true }
		)
	}
	catch (error) {
		res.status(500).json(error);
	}
}

exports.getWatchHistory = async function (req, res) {
	const { _id: userId } = req.user;

	try {
		const account = await Account.findOne({ user_id: userId }).populate({
			path: 'watched_history',
			populate: {
				path: 'videos',
				populate: 'author_id'
			}
		});

		const watchedHistoryDates = await Promise.all(account.watched_history.map(async function (historyDateDoc) {
			const formattedHistoryDateDoc = { ...historyDateDoc._doc };
			formattedHistoryDateDoc.videos = await Promise.all(formattedHistoryDateDoc.videos.map(async function (videoDoc) {
				const formattedVideoDoc = { ...videoDoc._doc }
				formattedVideoDoc.thumbnail_url = getSignedUrl({ key: formattedVideoDoc.thumbnail_key });
				formattedVideoDoc.url = getSignedUrl({ key: formattedVideoDoc.url });
				delete formattedVideoDoc.thumbnail_key;

				const authorAccount = await Account.findOne({ user_id: formattedVideoDoc.author_id });
				const authorUserInfo = await User.findOne({ _id: formattedVideoDoc.author_id });
				formattedVideoDoc.user = { ...formattedVideoDoc.author_id, username: authorAccount.username, _id: authorAccount._id, avatar: authorUserInfo.avatar };

				delete formattedVideoDoc.author_id;
				return formattedVideoDoc;
			}))
			return formattedHistoryDateDoc;
		}))

		res.status(200).json({ watchedHistoryDates });
	}
	catch (error) {
		console.log(error)
		res.status(500).json(error);
	}
}