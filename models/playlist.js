const mongoose = require('mongoose');
const Schema = mongoose.Schema

const { schemaOptions } = require('../constants/schemaOptions')

const PlaylistSchema = new Schema({
  title: { type: String, required, default: '' },
  author_id: { type: Schema.Types.ObjectId, ref: 'User', required },
  videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  is_auto_play: { type: Boolean, required, default: true },
}, schemaOptions);

module.exports = mongoose.model('Playlist', PlaylistSchema)
