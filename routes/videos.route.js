const express = require('express');
const router = express.Router();
const videos = require('../controllers/videos.controller');

router.get('/:key', function(req, res){
    videos.getVideoById(req, res)
});

router.post('/', async (req, res) => {
    videos.uploadVideo(req, res);
});

module.exports = router;