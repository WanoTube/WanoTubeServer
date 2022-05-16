const _ = require('lodash');

const Video = require('../../../models/video');
const Account = require('../../../models/account');
const { getSignedUrl } = require('../../../utils/aws-s3-handlers');

async function getChannelPublicInformation(req, res) {
  const { id } = req.params;

  try {
    const foundChannel = await Account.findOne({ _id: id }).populate('user_id');
    res.json(foundChannel);
  }
  catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

async function getAllChannelVideos(req, res) {
  const { _id } = req.user;

  try {
    const videos = await Video.find({ author_id: _id });
    const formattedVideoDocs = videos.map(function (videoDoc) {
      return formatVideoDocument(videoDoc);
    })
    res.json({ videos: formattedVideoDocs });
  }
  catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

async function getAllChannelPublicVideos(req, res) {
  const { id } = req.params;

  try {
    const foundChannel = await Account.findOne({ _id: id });
    const videos = await Video.find({ author_id: foundChannel.user_id, visibility: 0 }) // 0: public
    const formattedVideoDocs = videos.map(function (videoDoc) {
      return formatVideoDocument(videoDoc);
    })
    res.json({ videos: formattedVideoDocs });
  }
  catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

function formatVideoDocument(videoDoc) {
  const formmattedDoc = { ...videoDoc._doc };
  formmattedDoc.thumbnail_url = getSignedUrl({ key: formmattedDoc.thumbnail_key });
  formmattedDoc.url = getSignedUrl({ key: formmattedDoc.url });
  delete formmattedDoc.thumbnail_key;
  return formmattedDoc;
}

async function followChannel(req, res) {
  console.log("followChannel")
  const { channelId: followerId } = req.user;
  const { id: followedId } = req.params;
  console.log({ followedId, followerId })
  try {
    const followedChannel = await Account.findOneAndUpdate(
      { _id: followedId },
      { $inc: { number_of_followers: 1 } },
      { new: true }
    );
    if (!followedChannel) return res.status(400).json({ message: "Channel cannot be found!" })

    await Account.findOneAndUpdate(
      { _id: followerId },
      { $addToSet: { followings: followedId } },
      { new: true }
    ).select("+followings");;

    res.json({ number_of_followers: followedChannel.number_of_followers });
  }
  catch (err) {
    console.log(err);
    res.status(500).json(err)
  }
}

async function unfollowChannel(req, res) {
  console.log("unfollowChannel")
  const { channelId: followerId } = req.user;
  const { id: followedId } = req.params;

  try {
    const followedChannel = await Account.findOneAndUpdate(
      { _id: followedId },
      { $inc: { number_of_followers: -1 } },
      { new: true }
    );
    if (!followedChannel) return res.status(400).json({ message: "Channel cannot be found!" })

    await Account.findOneAndUpdate(
      { _id: followerId },
      { $pull: { followings: followedId } },
      { new: true }
    ).select("+followings");

    res.json({ number_of_followers: followedChannel.number_of_followers });
  }
  catch (err) {
    console.log(err);
    res.status(500).json(err)
  }
}

module.exports = {
  getAllChannelVideos,
  getAllChannelPublicVideos,
  getChannelPublicInformation,
  followChannel,
  unfollowChannel
}