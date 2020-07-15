import { Document } from 'mongoose'
import { ObjectId } from 'bson'
import { Maps } from 'kenote-config-helper'
import { ResponseTeamDocument } from './team'

export interface CreateDitchDocument extends EditDitchDocument {
  channel          : string
}

export interface ResponseDitchDocument extends Document {
  id                 : number
  name               : string
  label              : string
  channel            : string
  group              : string
  teams              : ResponseTeamDocument[]
  cardinal_number    : Maps<number>
}

export interface EditDitchDocument {
  name              ?: string
  label             ?: string
  group             ?: string
  teams             ?: Array<ObjectId | string>
  cardinal_number   ?: Maps<number>
}

export interface UpdateDithsDocument {
  channel           ?: string
  content            : string
}