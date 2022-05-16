const express = require('express');
const router = express.Router();

const userRoutes = require('./users.route');
const videoRoutes = require('./videos.route');
const likeRoutes = require('./likes.route');
const commentRoutes = require('./comments.route');
const authRoutes = require('./auth.route');
const channelRoutes = require('./channels.route');

router.get('/', function (req, res, next) {
  res.send("Hello world!")
});

router.use('/users', userRoutes); // v1/users
router.use('/videos', videoRoutes); // v1/videos
router.use('/likes', likeRoutes); // v1/likes
router.use('/comments', commentRoutes); // v1/comments
router.use('/auth', authRoutes); // v1/auth
router.use('/channels', channelRoutes); // v1/auth

module.exports = router;
