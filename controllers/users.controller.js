const User = require('../models/users.model');

exports.create = function (req, res) {
    var newUser = new User(req.body);
    console.log(req.body);
    newUser.save(function (err) {
            if(err) {
            res.status(400).send('Unable to save shark to database');
        } else {
            res.redirect('/users/index');
        }
  });
};

exports.list = function (req, res) {
    User.find({}).exec(function (err, users) {
        if (err) {
            return res.send(500, err);
        }
        console.log(users)
        res.send(users);
    });
};