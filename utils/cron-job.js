const cron = require('node-cron');
const Account = require('../models/account');
const { BlockedStatus } = require('../models/account');
const CopyrightStrike = require('../models/copyrightStrike');


exports.scheduleEnableBlockedChannel = (channelId, duration) => {
  console.log("XXXXXXXXXXXXXXXXXXXXXXXX");
  return cron.schedule(`*/10 * * * * *`, async () => {
    console.log("XXXXXXXXXXXXXXXXXXXXXXXX------------------------");
    await Account.findOneAndUpdate(
      { _id: channelId },
      {
        blocked_status: BlockedStatus.NONE
      },
      { new: true }
    );
  }, {
    scheduled: false
  });
}

exports.scheduleCopyrightStrikeExpire = (channelId, duration) => {
  console.log("oooooooooooooooooooooooooooo")
  return cron.schedule(`*/20 * * * * *`, async () => {
    console.log("oooooooooooooooooooooooooooo----------------------")
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
  }, {
    scheduled: false
  });
}