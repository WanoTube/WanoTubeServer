const User = require('../models/users');

exports.createUser = function (req, res) {
    var newUser = new User(req.body);
    newUser.save(function (err) {
            if(err) {
            res.status(400).send(err);
        } else {
            res.send(newUser)
        }
    });
};

exports.getAllUsers = function (req, res) {
    User.find({}).exec(function (err, users) {
        if (err) {
            return res.send(500, err);
        }
        res.send(users);
    });
};