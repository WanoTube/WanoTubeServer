const express = require('express');
const router = express.Router();
const likesController = require('../controllers/likes.controller');
const api = require("../utils/api-routes")

router.get('/', likesController.getAllLikes)

router.delete(api.actions.delete + '/:id', likesController.deleteLikeInfoById)

router.delete(api.actions.delete, likesController.deleteLikeInfo)

module.exports = router;