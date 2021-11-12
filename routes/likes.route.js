const express = require('express');
const router = express.Router();
const likes = require('../controllers/likes.controller');
const api = require("../utils/api-routes")

router.get('/', likes.getAllLikes)

router.delete(api.actions.delete + '/:id', likes.deleteLikeInfoById)

router.delete(api.actions.delete, likes.deleteLikeInfo)

module.exports = router;