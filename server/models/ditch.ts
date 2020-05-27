import { Schema } from 'mongoose'

const ditchSchema = new Schema({
  id: {
    type: Number,
    default: 0,
    index: { unique: true }
  },
  name: {
    type: String,
    required: true
  },
  label: {
    type: String
  },
  channel: {
    type: String
  },
  group: {
    type: String
  },
  teams: [{
    type: Schema.Types.ObjectId,
    ref: 'team'
  }],
  cardinal_number: {
    type: Object,
    default: {}
  }
})

export default ditchSchema