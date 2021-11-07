const express = require('express');
const router = express.Router();
const likes = require('../controllers/likes.controller');
const api = require("../utils/api-routes")

router.get('/', likes.getAllLikes)

// router.get("/:id", likes.getLike);

// router.put(api.actions.update, likes.updateLike);

