const express = require('express');
const router = express.Router();
const comments = require('../controllers/comments.controller');
const api = require("../utils/api-routes")

// router.get('/', likes.getAllComments)

router.delete(api.actions.delete + '/:id', comments.deleteCommentInfoById)

router.delete(api.actions.delete, comments.deleteCommentInfo)

module.exports = router;