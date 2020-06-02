import { Schema, model } from 'mongoose'

const schema: Schema = new Schema({
  id: {
    type: Number,
    default: 0,
    index: { unique: true }
  },
  name: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  platform: {
    type: Array,
    default: []
  },
  access: {
    type: Array,
    default: []
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'store'
  },
  default: {
    type: Boolean,
    default: false
  }
})

export default model('group', schema)
