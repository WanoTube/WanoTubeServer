var express = require('express');
var router = express.Router();

const api = require("../utils/api-routes");
const usersRoute = require('../routes/users.route');
const videoRoute = require('../routes/videos.route');
const likeRoute = require('../routes/likes.route');

router.get('/', function(req, res, next) {
    res.send("Hello world!")
});

router.use(api.version + api.objects.users , usersRoute); // v1/users
router.use(api.version + api.objects.videos , videoRoute); // v1/videos
router.use(api.version + api.objects.likes , likeRoute); // v1/videos

module.exports = router;
