import { Document } from 'mongoose'
import { ObjectId } from 'bson'
import { Maps } from 'kenote-config-helper'
import { ResponseUserDocument } from './user'

export interface CreateTeamDocument extends EditTeamDocument {
  name             : string
}

export interface EditTeamDocument {
  name            ?: string
  description     ?: string
  super           ?: boolean
  platform        ?: number[]
  access          ?: string[]
  rtsps           ?: Maps<string[]>
  owner           ?: ObjectId | string
}

export interface ResponseTeamDocument extends Document {
  id               : number
  name             : string
  description     ?: string
  platform         : number[]
  access           : string[]
  rtsps            : Maps<string[]>
  super            : boolean
  owner           ?: ResponseUserDocument
}