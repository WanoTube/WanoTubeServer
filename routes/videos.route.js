const express = require('express');
const router = express.Router();
const videos = require('../controllers/videos.controller');
const videoInfos = require('../controllers/video-info.controller');
const likes = require('../controllers/likes.controller');

const api = require("../utils/api-routes")

router.get(api.actions.search, videoInfos.search)

router.get('/:id', videoInfos.getVideoInfoById);

router.get('/:id/likes', likes.getAllLikes)

router.get('/stream/:key', videos.getVideoById);

router.get('/', videoInfos.getAllVideoInfos)

router.post(api.actions.upload, videos.uploadVideo);

router.put(api.actions.update, videoInfos.updateVideoInfo)

router.delete(api.actions.delete + "/:id", videoInfos.deleteVideoInfo);

module.exports = router;