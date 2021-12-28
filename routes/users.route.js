const express = require('express');
const router = express.Router();
const user = require('../controllers/users.controller');
const verifyToken = require('./../middlewares/verifyToken.middleware');

router.get('/', verifyToken, user.getAllUsers);

router.post('/', user.createUser);

router.get('/avatar/:key', user.getAvatar)

module.exports = router;