import { Schema, model } from 'mongoose'

const schema: Schema = new Schema({
  id: {
    type: Number,
    default: 0,
    index: { unique: true }
  },
  username: {
    type: String,
    required: true
  },
  nickname: {
    type: String
  },
  avatar: {
    type: String
  },
  sex: {
    type: Number,
    default: 0
  },
  email: {
    type: String
  },
  mobile: {
    type: String
  },
  encrypt: {
    type: String
  },
  salt: {
    type: String
  },
  jw_token: {
    type: String
  },
  binds: {
    type: Array,
    default: []
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'group'
  },
  teams: [{
    type: Schema.Types.ObjectId,
    ref: 'team'
  }],
  access: {
    type: Array,
    default: []
  },
  rstps: {
    type: Object,
    default: {}
  },
  create_at: {
    type: Date,
    default: Date.now
  },
  update_at: {
    type: Date,
    default: Date.now
  }
})

export default model('user', schema)
