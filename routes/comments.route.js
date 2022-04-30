const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments.controller');
const api = require("../utils/api-routes")

router.delete(api.actions.delete + '/:id', commentsController.deleteCommentInfoById)

router.delete(api.actions.delete, commentsController.deleteCommentInfo)

module.exports = router;