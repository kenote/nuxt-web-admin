import { Schema, model } from 'mongoose'

const schema: Schema = new Schema({
  id: {
    type: Number,
    default: 0,
    index: { unique: true }
  },
  protocode: {
    type: Number
  },
  protoname: {
    type: String
  },
  payload: {
    type: String
  },
  response: {
    type: String
  },
  rstp: {
    type: String
  },
  channel: {
    type: String
  },
  create_at: {
    type: Date,
    default: Date.now
  }, 
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  }
})

export default model('proto', schema)
