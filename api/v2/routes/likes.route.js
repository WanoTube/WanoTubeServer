const express = require('express');
const router = express.Router();
const likesController = require('../controllers/likes.controller');

router.get('/', likesController.getAllLikes)

router.delete('/delete/:id', likesController.deleteLikeInfoById)

router.delete('/delete', likesController.deleteLikeInfo)

module.exports = router;