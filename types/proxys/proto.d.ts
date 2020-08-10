import { Document } from 'mongoose'
import { ObjectId } from 'bson'
import { ResponseUserDocument } from './user'

export interface ResponseProtoDocument extends Document {
  id               : number
  protoname        : string
  protocode        : number
  payload          : string
  response         : string
  rstp             : string
  channel          : string
  create_at        : Date
  user             : ResponseUserDocument
}

export interface CreateProtoDocument extends EditDitchDocument {
  channel          : string
  protoname        : string
  protocode        : number
  payload          : string
  response        ?: string
  rstp             : string
  channel          : string
  user             : ObjectId | string
}