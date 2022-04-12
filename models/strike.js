const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { schemaOptions } = require('../constants/schemaOptions')

const strikeSchema = new Schema({
  level: { type: Number, max: 3, min: 1, default: 1 },
  effect_date: { type: Date, default: new Date(Date.now()) }
}, schemaOptions)

const Strike = mongoose.model('Strike', strikeSchema)

module.exports = {
  strikeSchema,
  Strike
}