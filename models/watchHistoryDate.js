const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { schemaOptions } = require('../constants/schemaOptions');

const WatchHistoryDateSchema = new Schema({
  account_id: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  date: { type: String, default: "" },
  videos: [{ type: Schema.Types.ObjectId, ref: 'Video', default: [] }]
}, schemaOptions);

module.exports = mongoose.model('WatchHistoryDate', WatchHistoryDateSchema);