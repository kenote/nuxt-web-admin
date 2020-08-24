import { Schema, model } from 'mongoose'

const schema = new Schema({
  id: {
    type: Number,
    default: 0,
    index: { unique: true }
  },
  name: {
    type: String
  },
  description: {
    type: String,
    default: ''
  },
  detail: {
    type: Object,
    default: {}
  },
  // 品牌
  exbrand: {

  },
  // 归类
  categorize: {
    
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

export default model('product', schema)