const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://127.0.0.1:27017/watch-out-server')
const User = new Schema ({
        name: { type: String, required: true },
        character: { type: String, required: true },
});

module.exports = mongoose.model('User', User)