const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments.controller');

router.get('/:id/replies', commentsController.getCommentReplies);

router.delete('/delete/:id', commentsController.deleteCommentInfoById)

router.delete('/delete', commentsController.deleteCommentInfo)

module.exports = router;