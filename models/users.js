var mongoose = require("mongoose");

const User = new mongoose.Schema ({
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        email: { type: String, required: true },
        gender: { type: String },
        birth_date: { type: Date, required: false },
        phone: { type: Number, required: false },
        country: { type: String }
});

module.exports = mongoose.model('User', User)