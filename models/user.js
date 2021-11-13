var mongoose = require("mongoose");
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
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        email: {
                type: String,
                required: true,
                min: 6,
                max: 225
            },
        gender: { type: String },
        birth_date: { type: Date },
        phone: { type: Number },
        country: { type: String },
        password: {
            type: String,
            required: true,
            min: 6,
            max: 255
        }
}, schemaOptions);

module.exports = mongoose.model('User', User)