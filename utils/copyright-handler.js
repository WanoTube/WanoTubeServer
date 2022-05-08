const Account = require('../models/account');
const CopyrightStrike = require('../models/copyrightStrike');
const { BlockedStatus } = require('../constants/user');

const STRIKE_DURATION = 180; //days
const BLOCK_ACCOUNT_DURATION_1 = 10; //days
const BLOCK_ACCOUNT_DURATION_2 = 20; //days

async function handleCopyright(title, channelId) {
  const newCopyrightStrike = await CopyrightStrike.create({ video_title: title });
  const updatedAccount = await Account.findOneAndUpdate(
    { _id: channelId },
    {
      $push: { strikes: newCopyrightStrike._id },
    },
    { new: true }
  ).select('+strikes');
  const strikeCount = updatedAccount.strikes.length;

  if (strikeCount >= 3 || strikeCount <= 0) return;

  const duration1 = strikeCount === 1 ? BLOCK_ACCOUNT_DURATION_1 : BLOCK_ACCOUNT_DURATION_2;
  setTimeout(() => {
    console.log(strikeCount)
    if (strikeCount > 2) return;
    _enableBlockedChannel(channelId);
  }, duration1 * 1000);

  const duration2 = STRIKE_DURATION;
  setTimeout(() => {
    if (updatedAccount.blocked_status !== BlockedStatus.PERMANENTLY) {
      console.log("_expireCopyrightStrike");
      _expireCopyrightStrike(channelId, newCopyrightStrike._id);
    }
  }, duration2 * 1000);
}

const _enableBlockedChannel = async function (channelId) {
  await Account.findOneAndUpdate(
    { _id: channelId, blocked_status: BlockedStatus.TEMPORARILY },
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