const _ = require('lodash');
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const Video = require('../models/video');
const { VideoTag } = require('../constants/video');
const User = require('../models/user');
const Account = require('../models/account');
const WatchHistoryDate = require('../models/watchHistoryDate');
const { getSignedUrl } = require('../utils/aws-s3-handlers');
const { generateFileFromBuffer } = require('../utils/videos-handlers');
const { uploadToS3 } = require('../utils/aws-s3-handlers');
const { removeRedundantFiles } = require('../utils/file-handler');

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
			});

			res.json({ videos: formattedDocs });
		})
}

exports.getVideoInfoById = async function (req, res, next) {
	try {
		const { id } = req.params;
		if (!ObjectId.isValid(id))
			return res.status(400).json({ message: "This video isn't available any more" });
		const video = await Video.findOne({ _id: id }).select("+customized_thumbnail_key +autogenerated_thumbnails_key ");
		if (!video)
			return res.status(400).json({ message: "This video isn't available any more" });

		if (video.visibility === 3 && (!req.user || video.author_id.toString() !== req.user._id))
			return res.status(400).json({ message: "Video unavailable. This video have copyright claimed" });

		if (video.visibility === 1 && (!req.user || video.author_id.toString() !== req.user._id))
			return res.status(400).json({ message: "Video unavailable. This video is private" });


		const formmattedDoc = { ...video._doc };
		formmattedDoc.thumbnail_url = getSignedUrl({ key: formmattedDoc.thumbnail_key });
		formmattedDoc.autogenerated_thumbnails_url = formmattedDoc.autogenerated_thumbnails_key.map(key => getSignedUrl({ key }));
		formmattedDoc.url = getSignedUrl({ key: formmattedDoc.url });

		formmattedDoc.thumbnail_key_index = formmattedDoc.autogenerated_thumbnails_key.indexOf(formmattedDoc.thumbnail_key) + 1;

		delete formmattedDoc.thumbnail_key;
		delete formmattedDoc.autogenerated_thumbnails_key;

		const channelAccount = await Account.findOne({ user_id: video.author_id }).populate("user_id");
		formmattedDoc.user = { ...channelAccount, avatar: channelAccount.user_id.avatar, username: channelAccount.username, channel_id: channelAccount._id };
		delete formmattedDoc.author_id;

		res.json(formmattedDoc);
	}
	catch (err) {
		console.log({ err })
		next(err);
	}
};

exports.search = function (req, res) {
	const searchKey = req.query.search_query
	// TO-DO: SEARCH IN TITLE, not whole title
	Video.find({
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
	const { id: videoId, title, description, privacy, thumbnailIndex, tags } = req.body
	const { _id: userId, channelId } = req.user;

	try {
		const foundVideo = await Video.findOne(
			{ _id: videoId, author_id: userId }
		).select("+autogenerated_thumbnails_key");
		if (!foundVideo) return res.status(403).json({
			message: "Not allowed"
		});

		if (thumbnailIndex == 0) {
			const { fileKey: thumbnailKey } = await generateFileFromBuffer(req.files.thumbnailFile, userId, "thumbnails");
			await uploadToS3(thumbnailKey, val => val / 4 + 50 / 3 * (i + 1), channelId);
			foundVideo.thumbnail_key = thumbnailKey;
			removeRedundantFiles(thumbnailKey);
		}
		else {
			foundVideo.thumbnail_key = foundVideo.autogenerated_thumbnails_key[thumbnailIndex - 1];
		}
		foundVideo.title = title;
		foundVideo.description = description;
		foundVideo.tags = tags === '' ? [] : tags.split(",");
		foundVideo.visibility = privacy;

		const updatedVideo = await foundVideo.save();
		res.json(updatedVideo);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
}

exports.deleteVideoInfo = async function (req, res) {
	const { id: videoId } = req.body;
	const { _id: userId } = req.user;
	try {
		await Video.deleteOne({ _id: videoId, author_id: userId });
		res.sendStatus(204);
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
	const formattedToday = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`

	try {
		const foundAccount = await Account.findOne(
			{ user_id: viewerId }
		);
		if (!foundAccount) return res.status(401).json("Channel does not exist")

		const foundWatchHistoryDate = await WatchHistoryDate.findOne(
			{ account_id: foundAccount._id, date: formattedToday }
		)
		let watchHistoryDate;
		if (!foundWatchHistoryDate) {
			const newWatchHistoryDate = await WatchHistoryDate.create({
				account_id: foundAccount._id, date: formattedToday, videos: [videoId]
			});
			await Account.updateOne(
				{ _id: foundAccount._id },
				{ $addToSet: { watched_history: newWatchHistoryDate } },
				{ new: true }
			);
			watchHistoryDate = newWatchHistoryDate;
		}
		else {
			const updatedWatchHistoryDate = await WatchHistoryDate.updateOne(
				{ account_id: foundAccount._id, date: formattedToday },
				{ $addToSet: { videos: videoId } }
			)
			watchHistoryDate = updatedWatchHistoryDate;
		}
		await Video.findOneAndUpdate(
			{ _id: videoId },
			{
				$addToSet: { views: foundAccount._id }
			},
			{ new: true }
		).select('+views')
		res.status(200).json({ watchHistoryDate });
	}
	catch (error) {
		console.log(error)
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
				formattedVideoDoc.user = { ...formattedVideoDoc.author_id, username: authorAccount.username, channel_id: authorAccount._id, avatar: authorUserInfo.avatar };
				delete formattedVideoDoc.author_id;
				return formattedVideoDoc;
			}))
			return formattedHistoryDateDoc;
		}))
		watchedHistoryDates.sort((a, b) => b.created_at - a.created_at)

		res.status(200).json({ watchedHistoryDates });
	}
	catch (error) {
		console.log(error)
		res.status(500).json(error);
	}
}

exports.getWatchLaterVideos = async function (req, res) {
	const { channelId } = req.user;

	try {
		const channel = await Account.findOne({ _id: channelId }).populate({
			path: 'watch_later_videos',
			populate: 'author_id'
		});
		const videos = channel.watch_later_videos.map(((videoDoc) => {
			const formattedVideoDoc = { ...videoDoc._doc }
			formattedVideoDoc.thumbnail_url = getSignedUrl({ key: formattedVideoDoc.thumbnail_key });
			formattedVideoDoc.url = getSignedUrl({ key: formattedVideoDoc.url });
			formattedVideoDoc.user = { ...formattedVideoDoc.author_id, username: channel.username, channel_id: channel._id, avatar: channel.avatar };
			delete formattedVideoDoc.author_id;
			return formattedVideoDoc;
		}))

		res.json({ videos })
	}
	catch (error) {
		console.log(error)
		res.status(500).json(error);
	}
}

exports.watchLater = async function (req, res) {
	const { channelId } = req.user;
	const { videoId } = req.params;

	try {
		const foundVideo = await Video.findOne({ _id: videoId });
		if (!foundVideo) return res.status(400).json({
			message: "Video id not found"
		});

		await Account.findOneAndUpdate(
			{ _id: channelId },
			{ $addToSet: { watch_later_videos: foundVideo._id } }
		);
		return res.json({
			video: foundVideo
		})
	}
	catch (error) {
		console.log(error)
		res.status(500).json(error);
	}
}

exports.removeWatchLaterVideo = async function (req, res) {
	const { channelId } = req.user;
	const { videoId } = req.params;

	try {
		const foundVideo = await Video.findOne({ _id: videoId });
		if (!foundVideo) return res.status(400).json({
			message: "Video id not found"
		});

		await Account.findOneAndUpdate(
			{ _id: channelId },
			{ $pull: { watch_later_videos: foundVideo._id } }
		);
		return res.json({
			video: foundVideo
		})
	}
	catch (error) {
		console.log(error)
		res.status(500).json(error);
	}
}

exports.getAllVideoTags = async function (req, res) {
	const videoTags = Object.values(VideoTag);
	res.json({ tags: videoTags });
}