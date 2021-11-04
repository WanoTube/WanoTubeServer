const express = require('express');
const router = express.Router();
const videos = require('../controllers/videos.controller');
const api = require("../utils/api-routes")

router.get(api.actions.search, function(req, res) {
    videos.search(req, res)
})

router.get('/:key', function(req, res) {
    videos.getVideoById(req, res)
});

router.get('/', function(req, res) {
    videos.getAllVideoInfos(req, res)
})

router.post(api.actions.update, function (req, res) {
    videos.updateVideoInfo(req, res)
})

router.post('/', async (req, res) => {
    videos.uploadVideo(req, res);
});

router.delete(api.actions.delete + "/:id", videos.deleteVideoInfo);

module.exports = router;