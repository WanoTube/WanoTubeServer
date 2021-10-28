const mongoose = require('mongoose');

const Video = new mongoose.Schema ({
    title: { type: String, required: true },
    channelId: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    description: { type: String },
    uploadedAt: { type: Date, required: true },
    modifiedAt: { type: Date },
});

module.exports = mongoose.model('Video', Video)