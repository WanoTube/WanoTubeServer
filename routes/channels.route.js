const express = require('express');
const router = express.Router();
const channelsController = require('../controllers/channels.controller');
const { requireAuth } = require('../middlewares/verifyToken.middleware');

router.get('/videos', requireAuth, channelsController.getAllChannelVideos);

router.get('/author/:authorId/videos', channelsController.getAllChannelPublicVideos);

router.get('/:id/info', channelsController.getChannelPublicInformation);

module.exports = router;