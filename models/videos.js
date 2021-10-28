const mongoose = require('mongoose');

const schemaOptions = {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  };
  
const Video = new mongoose.Schema ({
    title: { type: String, required: true },
    // channelId: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    description: { type: String }
}, schemaOptions);

module.exports = mongoose.model('Video', Video)