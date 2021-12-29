const mongoose = require("mongoose");
const schemaOptions = {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};
const User = new mongoose.Schema ({
        first_name: { type: String },
        last_name: { type: String },
        gender: { type: Number, default: 1, required: true }, // 0: Female, 1: Male
        birth_date: { type: Date },
        phone_number: { type: String },
        country: { type: String },
        avatar: { type: String },
        description: { type: String }
}, schemaOptions);

module.exports = mongoose.model('User', User)