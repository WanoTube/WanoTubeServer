const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const api = require("../utils/api-routes")

router.get('/:id', usersController.getUserById);

router.get('/account/:user_id', usersController.getAccountByUserId);

router.get('/', usersController.getAllUsers);

router.post('/', usersController.createUser);

router.put('/update', usersController.updateUser);

router.get('/avatar/:key', usersController.getAvatar)

router.post('/avatar/', usersController.updateAvatar)

module.exports = router;