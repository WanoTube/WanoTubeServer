const _ = require('lodash');

const Video = require('../models/video');
const Account = require('../models/account');
const Comment = require('../models/comment');
const { formatVideo } = require('../utils/videos-handlers');

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
  console.log("getAllChannelVideos")
  const { _id } = req.user;

  try {
    const videos = await Video.find({ author_id: _id });
    const formattedVideoDocs = await Promise.all(videos.map(function (video) {
      return formatVideo({ ...video._doc });
    }));
    formattedVideoDocs.sort((a, b) => b.created_at - a.created_at);
    res.json({ videos: formattedVideoDocs });
  }
  catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

async function getAllChannelPublicVideos(req, res) {
  console.log("getAllChannelPublicVideos")
  const { id } = req.params;

  try {
    const foundChannel = await Account.findOne({ _id: id });
    const videos = await Video.find({ author_id: foundChannel.user_id, visibility: 0 }) // 0: public
    const formattedVideoDocs = await Promise.all(videos.map(function (video) {
      return formatVideo({ ...video._doc });
    }));
    formattedVideoDocs.sort((a, b) => b.created_at - a.created_at);
    res.json({ videos: formattedVideoDocs });
  }
  catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

async function followChannel(req, res) {
  console.log("followChannel")
  const { channelId: followerId } = req.user;
  const { id: followedId } = req.params;
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

async function hideUserFromChannel(req, res) {
  const { channelId } = req.user;
  const { userId } = req.params;

  const blockedAccount = await Account.findOne(
    { user_id: userId }
  );
  if (!blockedAccount) return res.status(400).status({
    message: "Account cannot be found!"
  })

  const updatedAccount = await Account.findOneAndUpdate(
    { _id: channelId },
    { $addToSet: { blocked_accounts: blockedAccount._id } }
  );

  res.json({
    blockedAccounts: updatedAccount.blocked_accounts,
  });
}

async function updateHiddenAccountList(req, res) {
  const { channelId } = req.user;
  const { hiddenChannelIdList } = req.body;

  const updatedAccount = await Account.findOneAndUpdate(
    { _id: channelId },
    { $set: { blocked_accounts: hiddenChannelIdList } }
  );

  res.json({
    blockedAccounts: updatedAccount.blocked_accounts
  });
}

module.exports = {
  getAllChannelVideos,
  getAllChannelPublicVideos,
  getChannelPublicInformation,
  followChannel,
  unfollowChannel,
  hideUserFromChannel,
  updateHiddenAccountList
}