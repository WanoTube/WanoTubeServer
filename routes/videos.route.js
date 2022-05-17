const express = require('express');
const router = express.Router();

const videosController = require('../controllers/new-videos.controller');
const videoInfosController = require('../controllers/video-info.controller');
const likesController = require('../controllers/likes.controller');
const commentsController = require('../controllers/comments.controller');
const { requireAuth } = require("../middlewares/verifyToken.middleware");
const { forbidBlockedAccount } = require('../middlewares/forbidBlockedAccount');

router.get('/search', videoInfosController.search);

router.get('/public', videoInfosController.getAllPublicVideoInfos);

router.get('/tags', videoInfosController.getAllVideoTags);

router.get('/feed', requireAuth(false), videoInfosController.getFeed);

router.get('/history', requireAuth(), videoInfosController.getWatchHistory);

router.get('/watch-later', requireAuth(), videoInfosController.getWatchLaterVideos);

router.get('/stream/:key', videosController.getVideoById);

router.patch('/watch-later/:videoId/remove', requireAuth(), videoInfosController.removeWatchLaterVideo);

router.patch('/watch-later/:videoId', requireAuth(), videoInfosController.watchLater);

router.post('/like', likesController.likeVideo);

router.post('/comment', requireAuth(), commentsController.addComment);

router.post('/comment/delete', commentsController.deleteCommentFromVideo);

router.post('/upload', requireAuth(), forbidBlockedAccount, videosController.uploadAndProcessVideo);

router.post('/', requireAuth(), forbidBlockedAccount, videosController.uploadVideoWithUndergroundProcess);

router.patch('/update', requireAuth(), forbidBlockedAccount, videoInfosController.updateVideoInfo)

router.post('/delete', requireAuth(), forbidBlockedAccount, videoInfosController.deleteVideoInfo);

router.get('/:id', requireAuth(false), videoInfosController.getVideoInfoById);

router.get('/:id/suggestion', requireAuth(false), videoInfosController.getVideoSuggestion);

router.get('/:id/likes', likesController.getAllLikesByVideoId);

router.patch('/:id/view', requireAuth(), videoInfosController.increaseView);

router.get('/:id/comments', commentsController.getAllCommentsByVideoId);

router.get('/:id/total-likes', likesController.getTotalLikesByVideoId);

router.get('/:id/total-comments', commentsController.getTotalCommentsByVideoId);

router.get('/:id/total-views', videoInfosController.getTotalViewsByVideoId);

module.exports = router;