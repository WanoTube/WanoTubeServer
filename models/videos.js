const mongoose = require('mongoose');
const Schema = mongoose.Schema
const schemaOptions = {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  };
  
const Video = new Schema ({
    title: { type: String, required: true },
    // channelId: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    description: { type: String },
    recognitionResult: { type: Schema.Types.Mixed }
}, schemaOptions);

module.exports = mongoose.model('Video', Video)