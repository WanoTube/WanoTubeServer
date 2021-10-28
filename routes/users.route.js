const express = require('express');
const router = express.Router();
const user = require('../controllers/users.controller');

router.get('/', function(req, res){
    user.getAllUsers(req,res); 
});

router.post('/', function(req, res) {
    user.createUser(req,res);
});

module.exports = router;