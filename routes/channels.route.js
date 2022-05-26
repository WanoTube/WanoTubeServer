const express = require('express');
const router = express.Router();
const channelsController = require('../controllers/channels.controller');
const { requireAuth } = require('../middlewares/authHandler');
const { createJob } = require('../utils/aws/elasticTranscoder');

router.get('/', async (req, res, next) => {
  try {
    const job = await createJob("cambongfa.mp4");
    res.json({ job });
  }
  catch (err) {
    next(err);
  }
})

router.get('/videos', requireAuth(), channelsController.getAllChannelVideos);

router.get('/:id/videos', channelsController.getAllChannelPublicVideos);

router.get('/:id/info', channelsController.getChannelPublicInformation);

router.patch('/:id/follow', requireAuth(), channelsController.followChannel);

router.patch('/:id/unfollow', requireAuth(), channelsController.unfollowChannel);

router.patch('/users/:userId/hide', requireAuth(), channelsController.hideUserFromChannel);

router.put('/hidden-accounts', requireAuth(), channelsController.updateHiddenAccountList);

module.exports = router;