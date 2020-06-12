import { Document } from 'mongoose'
import { ObjectId } from 'bson'
import { UpdateWriteResult } from 'kenote-mongoose-helper'
import { ResponseUserDocument } from './user'

export type VerifyType = 'email' | 'mobile' | 'code'

export interface CreateVerifyDocument {
  type           : VerifyType
  user          ?: ObjectId | string
  token         ?: string
}

export interface ResponseVerifyDocument extends Document {
  id             : number
  type           : VerifyType
  token          : string
  user           : ResponseUserDocument
  create_at      : Date
  approved       : boolean
  application    : string
  update_at      : Date
}

export interface UpdateVerifyResult extends UpdateWriteResult {
  token          : string
}

export interface VerifyGenerateOptions {
  name          ?: string
  verify_id     ?: string
}