import { Schema } from 'mongoose'

const planSchema = new Schema({
  id: {
    type: Number,
    default: 0,
    index: { unique: true }
  },
  name: {
    type: String
  },
  type: {
    type: String
  },
  content: {
    type: String
  },
  channel: {
    type: String
  },
  create_at: {
    type: Date,
    default: Date.now
  },
  share: {
    type: Boolean,
    default: false
  },
  share_user: [{
    type: Schema.Types.ObjectId,
    ref: 'user'
  }],
  share_at: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  update_at: {
    type: Date,
    default: Date.now
  }
})

export default planSchema