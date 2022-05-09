const Account = require('../models/account');
const { BlockedStatus } = require('../constants/user');

exports.forbidBlockedAccount = async (req, res, next) => {
  const { channelId } = req.user;
  const foundAccount = await Account.findById(channelId);
  console.log(foundAccount.blocked_status);
  if (foundAccount.blocked_status !== BlockedStatus.NONE) {
    return res.status(403).json({
      message: "Not allowed"
    });
  }
  next();
}