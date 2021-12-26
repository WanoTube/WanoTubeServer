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
        role: { type: mongoose.Schema.Types.ObjectId, ref: "roleSchema", default: mongoose.mongo.ObjectId("61c835841cf23b3200a016e8") },
        avatar: { type: String },
}, schemaOptions);

module.exports = mongoose.model('User', User)