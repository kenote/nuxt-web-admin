import { Schema, model } from 'mongoose'

const schema: Schema = new Schema({
  id: {
    type: Number,
    default: 0,
    index: { unique: true }
  },
  name: {
    type: String
  },
  cdkey: {
    type: String,
    required: true
  },
  type: {
    type: String
  },
  setting: {
    type: Object,
    default: {}
  },
  stint: {
    type: Number,
    default: 0
  },
  uses: {
    type: Number,
    default: 0
  },
  used: {
    type: Boolean,
    default: false
  },
  create_at: {
    type: Date,
    default: Date.now
  },
  last_at: {
    type: Date,
    default: Date.now
  }
})

export default model('ticket', schema)
