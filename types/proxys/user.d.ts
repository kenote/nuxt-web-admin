import { Document } from 'mongoose'
import { ObjectId } from 'bson'
import { ResponseGroupDocument } from './group'
import { ResponseTeamDocument } from './team'

export interface RegisterUserDocument {
  username         : string
  password         : string
  email           ?: string
  mobile          ?: string
  group            : ObjectId | string
  teams           ?: Array<ObjectId | string>
}

export interface CreateUserDocument {
  username         : string
  encrypt          : string
  salt             : string
  email           ?: string
  mobile          ?: string
  group            : ObjectId | string
  teams           ?: Array<ObjectId | string>
}

export interface EditUserDocument {
  username        ?: string
  nickname        ?: string
  sex             ?: number
  avatar          ?: string
  email           ?: string
  mobile          ?: string
}

export interface ResponseUserDocument extends Document {
  id               : number
  username         : string
  nickname        ?: string
  avatar          ?: string
  sex              : number
  email            : string
  mobile          ?: string
  jw_token        ?: string
  binds            : string[]
  group            : ResponseGroupDocument
  teams            : ResponseTeamDocument[]
  access           : string[]
  create_at        : Date
  update_at        : Date
}

export interface SafeUserDocument extends ResponseUserDocument {
  encrpt           : string
  salt             : string
}

export type FindUserType = 'username' | 'email' | 'nickname' | 'mobile'