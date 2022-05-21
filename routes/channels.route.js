const express = require('express');
const router = express.Router();
const channelsController = require('../controllers/channels.controller');
const { requireAuth } = require('../middlewares/verifyToken.middleware');
const { createJob } = require('../utils/aws/elasticTranscoder');

router.get('/', async (req, res) => {
  try {
    const job = await createJob("kingdomrush.mp4");
    res.json({ job })
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

module.exports = router;