import { Document } from 'mongoose'

export interface CreateStoreDocument {
  upload_type    : string[]
  download_type  : string[]
}

export interface ResponseStoreDocument extends Document {
  id             : number
  upload_type    : string[]
  download_type  : string[]
}