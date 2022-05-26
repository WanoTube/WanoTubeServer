const express = require('express');
const router = express.Router();

const commentsController = require('../controllers/comments.controller');
const { requireAuth } = require('../middlewares/authHandler');

router.get('/:id/replies', commentsController.getCommentReplies);

router.patch('/:id/remove', requireAuth(), commentsController.removeComment);

module.exports = router;