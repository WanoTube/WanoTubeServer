const express = require('express');
const router = express.Router();

const api = require("../utils/api-routes");
const userRoutes = require('../routes/users.route');
const videoRoutes = require('../routes/videos.route');
const likeRoutes = require('../routes/likes.route');
const commentRoutes = require('../routes/comments.route');
const authRoutes = require('../routes/auth.route');
const channelRoutes = require('../routes/channels.route');

router.get('/', function (req, res, next) {
  res.send("Hello world!")
});

router.use(api.version + api.objects.users, userRoutes); // v1/users
router.use(api.version + api.objects.videos, videoRoutes); // v1/videos
router.use(api.version + api.objects.likes, likeRoutes); // v1/likes
router.use(api.version + api.objects.comments, commentRoutes); // v1/comments
router.use(api.version + api.objects.auth, authRoutes); // v1/auth
router.use(api.version + api.objects.channels, channelRoutes); // v1/auth

module.exports = router;
