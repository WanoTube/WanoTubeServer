const express = require('express');
const router = express.Router();
const videos = require('../controllers/videos.controller');

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

router.get('/:key', function(req, res){
    videos.getVideoById(req, res)
});

router.post('/', upload.single('image'), async (req, res) => {
    videos.uploadVideo(req,res);
});

module.exports = router;