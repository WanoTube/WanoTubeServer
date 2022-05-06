const mongoose = require('mongoose');
const Schema = mongoose.Schema

const { schemaOptions } = require('../constants/schemaOptions')

const CopyrightSchema = new Schema({
  video_id: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  registered_date: { type: Date, default: new Date(Date.now()) },
  approved_date: { type: Date, default: null },
  approver: [{ type: Schema.Types.ObjectId, ref: 'User', default: null }]
}, schemaOptions);

module.exports = mongoose.model('Copyright', CopyrightSchema);
