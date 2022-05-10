const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users.controller');
const api = require("../utils/api-routes")
const { requireAuth } = require("../middlewares/verifyToken.middleware")

router.get('/copyright-status', requireAuth(), usersController.getCopyrightStatus)

router.get('/account/:user_id', usersController.getAccountByUserId);

router.get('/', usersController.getAllUsers);

router.post('/', usersController.createUser);

router.get('/follow-info', requireAuth(), usersController.getFollowInfo);

router.put('/update', usersController.updateUser);

router.get('/avatar/:key', usersController.getAvatar)

router.post('/avatar', usersController.updateAvatar)

router.get('/:id', usersController.getUserById);

module.exports = router;