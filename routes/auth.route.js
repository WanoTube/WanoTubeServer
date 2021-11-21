const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/user');
const { registerValidator } = require('../validations/auth');

router.post('/register', async (request, response) => {
    const { error } = registerValidator(request.body);

    if (error) return response.send(registerValidator(request.body));

    const checkEmailExist = await User.findOne({ email: request.body.email });

    if (checkEmailExist) return response.status(422).send('Email is exist');

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(request.body.password, salt);

    const user = new User({
        username: request.body.username,
        email: request.body.email,
        password: hashPassword,
        first_name: request.body.first_name,
        last_name: request.body.last_name,
    });

    try {
        const newUser = await user.save();
        await response.send(newUser);
    } catch (err) {
        response.status(400).send(err);
    }
});

router.post('/login', async (request, response) => {
    const user = await User.findOne({email: request.body.email});
    if (!user) return response.status(422).send('Email or Password is not correct');
    const checkPassword = await bcrypt.compare(request.body.password, user.password);

    if (!checkPassword) return response.status(422).send('Email or Password is not correct');
    
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET, { expiresIn: 60 * 60 * 24 }); //outdated in 1 day
    response.header('auth-token', token).send(token);
    return response.send(`User ${user.username} has logged in`);
})

module.exports = router;