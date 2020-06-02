import { Document } from 'mongoose'
import { CreateStoreDocument, ResponseStoreDocument } from './store'

export interface CreateGroupDocument extends EditGroupDocument {
  name             : string
  level            : number
}

export interface EditGroupDocument {
  name            ?: string
  level           ?: number
  description     ?: string
  store           ?: CreateStoreDocument
  platform        ?: number[]
  access          ?: string[]
  default         ?: boolean
}

export interface ResponseGroupDocument extends Document {
  id               : number
  name             : string
  level            : number
  description      : string
  store            : ResponseStoreDocument
  platform         : number[]
  access           : string[]
  default          : boolean
}