const express = require('express');
const router = express.Router();
const user = require('../controllers/users.controller');
const verifyToken = require('./../middlewares/verifyToken.middleware');

// router.get('/:id', verifyToken, user.getUserById);

router.get('/:username', user.getUserByUsername);

router.get('/account/:user_id', user.getAccountByUserId);

router.get('/', verifyToken, user.getAllUsers);

router.post('/', user.createUser);

router.put('/update', user.updateUser);

router.get('/avatar/:key', user.getAvatar)

router.post('/avatar/', user.updateAvatar)

module.exports = router;