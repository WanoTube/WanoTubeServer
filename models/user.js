const mongoose = require("mongoose");
const schemaOptions = {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};
const User = new mongoose.Schema ({
        username: {
                type: String,
                required: true,
                min: 6,
                max: 255
        },
        first_name: { type: String },
        last_name: { type: String },
        email: {
                type: String,
                required: true,
                min: 6,
                max: 225
        },
        gender: { type: String },
        birth_date: { type: Date },
        phone_number: { type: String },
        country: { type: String },
        password: {
                type: String,
                required: true,
                min: 6,
                max: 255
        },
        is_admin: { type: Boolean, default: false },
        avatar: { type: String },
        description: { type: String }
}, schemaOptions);

module.exports = mongoose.model('User', User)