const Account = require('../models/account');
const CopyrightStrike = require('../models/copyrightStrike');

const { scheduleCopyrightStrikeExpire, scheduleEnableBlockedChannel } = require('../utils/cron-job');

async function handleCopyright(recognizedMusic, channelId) {
  if (!recognizedMusic || !recognizedMusic.recognizeResult) return;

  const newCopyrightStrike = await CopyrightStrike.create({});
  await Account.findOneAndUpdate(
    { _id: channelId },
    {
      $push: { strikes: newCopyrightStrike._id },
    },
    { new: true }
  ).select('+strikes');

  scheduleCopyrightStrikeExpire(channelId, newCopyrightStrike._id);
  scheduleEnableBlockedChannel(channelId);
}

module.exports = {
  handleCopyright
}