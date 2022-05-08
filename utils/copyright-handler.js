const Account = require('../models/account');
const CopyrightStrike = require('../models/copyrightStrike');
const { BlockedStatus } = require('../constants/user');

const STRIKE_DURATION = 90; //days
const BLOCK_ACCOUNT_DURATION_1 = 30; //days
const BLOCK_ACCOUNT_DURATION_2 = 40; //days

async function handleCopyright(title, channelId) {
  const newCopyrightStrike = await CopyrightStrike.create({ video_title: title });
  const updatedAccount = await Account.findOneAndUpdate(
    { _id: channelId },
    {
      $push: { strikes: newCopyrightStrike._id },
    },
    { new: true }
  ).select('+strikes');

  const duration1 = updatedAccount.strikes.length === 1 ? BLOCK_ACCOUNT_DURATION_1 : BLOCK_ACCOUNT_DURATION_2;
  setTimeout(() => {
    _enableBlockedChannel(channelId);
  }, duration1 * 1000);

  const duration2 = STRIKE_DURATION;
  setTimeout(() => {
    _expireCopyrightStrike(channelId, newCopyrightStrike._id);
  }, duration2 * 1000);
}

const _enableBlockedChannel = async function (channelId) {
  await Account.findOneAndUpdate(
    { _id: channelId },
    {
      blocked_status: BlockedStatus.NONE
    },
    { new: true }
  );
}

const _expireCopyrightStrike = async function (channelId, strikeId) {
  await CopyrightStrike.findByIdAndUpdate(
    { _id: strikeId },
    {
      is_expired: true
    }
  );
  await Account.findOneAndUpdate(
    { _id: channelId },
    {
      $pull: { strikes: strikeId },
    },
    { new: true }
  ).select('+strikes');
}

module.exports = {
  handleCopyright
}