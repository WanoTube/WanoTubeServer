const express = require('express');
const router = express.Router();
const videosController = require('../controllers/new-videos.controller');
const videoInfosController = require('../controllers/video-info.controller');
const likesController = require('../controllers/likes.controller');
const commentsController = require('../controllers/comments.controller');

router.get('/users/:author_id', videoInfosController.getAllVideoInfosWithUserId)

router.get('/users/:author_id/public', videoInfosController.getAllPublicVideoInfosWithUserId)

router.get('/search', videoInfosController.search)

router.get('/public', videoInfosController.getAllPublicVideoInfos)

router.get('/:id', videoInfosController.getVideoInfoById);

router.get('/:id/likes', likesController.getAllLikesByVideoId)

router.get('/:id/comments', commentsController.getAllCommentsByVideoId)

router.get('/:id/total-likes', likesController.getTotalLikesByVideoId)

router.get('/:id/total-comments', commentsController.getTotalCommentsByVideoId)

router.get('/:id/total-views', videoInfosController.getTotalViewsByVideoId)

router.post('/like', likesController.likeVideo)

router.post('/comment', commentsController.commentVideo)

router.post('/comment/delete', commentsController.deleteCommentFromVideo)

router.get('/stream/:key', videosController.getVideoById);

router.get('/', videoInfosController.getAllVideoInfos)

router.post('/upload', videosController.uploadVideo);

router.put('/update', videoInfosController.updateVideoInfo)

router.post('/delete', videoInfosController.deleteVideoInfo);

module.exports = router;