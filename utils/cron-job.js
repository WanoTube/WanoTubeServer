const cron = require('node-cron');
const Account = require('../models/account');
const { BlockedStatus } = require('../models/account');
const CopyrightStrike = require('../models/copyrightStrike');

const STRIKE_DURATION = 30; //days
const BLOCK_ACCOUNT_DURATION_1 = 7; //days
const BLOCK_ACCOUNT_DURATION_2 = 14; //days

exports.scheduleEnableBlockedChannel = (channelId, times) => cron.schedule(`* * * */${times === 1 ? BLOCK_ACCOUNT_DURATION_1 : BLOCK_ACCOUNT_DURATION_2} * *`, async () => {
  await Account.findOneAndUpdate(
    { _id: channelId },
    {
      blocked_status: BlockedStatus.NONE
    },
    { new: true }
  )
})

exports.scheduleCopyrightStrikeExpire = async (channelId, strikeId) => cron.schedule(`* * * */${STRIKE_DURATION} * *`, async () => {
  await CopyrightStrike.findByIdAndUpdate(
    { _id: strikeId },
    {
      is_expired: true
    }
  )
  await Account.findOneAndUpdate(
    { _id: channelId },
    {
      $pull: { strikes: strikeId },
    },
    { new: true }
  ).select('+strikes');
}, {
  scheduled: false
});