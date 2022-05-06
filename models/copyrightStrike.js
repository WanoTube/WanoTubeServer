const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { schemaOptions } = require('../constants/schemaOptions');

const copyrightStrikeSchema = new Schema({
  issued_date: { type: Date, default: new Date(Date.now()) }
}, schemaOptions);

module.exports = mongoose.model('CopyrightStrike', copyrightStrikeSchema);
