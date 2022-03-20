const mongoose = require('mongoose')

const { schemaOptions } = require('../constants/schemaOptions');

const strikeSchema = new mongoose.Schema({
  level: { type: Number, max: 3, min: 1 },
  expectancy: { type: Number, default: 0 },
  description: { type: String, default: '' }
}, schemaOptions)

const Strike = mongoose.model('Strike', strikeSchema)

module.exports = {
  strikeSchema,
  Strike
}