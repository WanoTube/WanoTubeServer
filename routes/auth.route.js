const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/user');
const userController = require('../controllers/users.controller');

router.post('/register', userController.createUser);

router.post('/login', userController.login)

module.exports = router;