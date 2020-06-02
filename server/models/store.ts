import { Schema, model } from 'mongoose'

const schema: Schema = new Schema({
  id: {
    type: Number,
    default: 0,
    index: { unique: true }
  },
  upload_type: { 
    type: Array, 
    default: [] 
  },
  download_type: {
    type: Array, 
    default: []
  }
})

export default model('store', schema)
