const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users.controller');
const { requireAuth } = require("../middlewares/authHandler");

router.get('/copyright-status', requireAuth(), usersController.getCopyrightStatus);

router.get('/account/:user_id', usersController.getAccountByUserId);

router.get('/', usersController.getAllUsers);

router.post('/', usersController.createUser);

router.get('/follow-info', requireAuth(), usersController.getFollowInfo);

router.get('/followings', requireAuth(), usersController.getFollowingChannels);

router.put('/update', requireAuth(), usersController.updateUser);

router.get('/avatar/:key', usersController.getAvatar);

router.post('/avatar', usersController.updateAvatar);

router.get('/:id', usersController.getUserById);

module.exports = router;