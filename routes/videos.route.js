const express = require('express');
const router = express.Router();
const videos = require('../controllers/new-videos.controller');
const videoInfos = require('../controllers/video-info.controller');
const likes = require('../controllers/likes.controller');
const comments = require('../controllers/comments.controller');

const api = require("../utils/api-routes")

router.get('/users/:author_id', videoInfos.getAllVideoInfosWithUserId)

router.get(api.actions.search, videoInfos.search)

router.get('/public', videoInfos.getAllPublicVideoInfos)

router.get('/:id', videoInfos.getVideoInfoById);

router.get('/:id/likes', likes.getAllLikesByvideo_id)

router.get('/:id/comments', comments.getAllCommentsByvideo_id)

router.post('/like', likes.likeVideo)

router.post('/comment', comments.commentVideo)

router.post('/delete-comment', comments.deleteCommentFromVideo)

router.get('/stream/:key', videos.getVideoById);


router.get('/', videoInfos.getAllVideoInfos)

router.post(api.actions.upload, videos.uploadVideo);

router.put(api.actions.update, videoInfos.updateVideoInfo)

router.post(api.actions.delete, videoInfos.deleteVideoInfo);

module.exports = router;