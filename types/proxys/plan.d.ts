import { Document } from 'mongoose'
import { ObjectId } from 'bson'
import { KeyMap } from 'kenote-config-helper'
import { ResponseUserDocument } from './user'

export type PlanType = 'ditch' | 'draft' | 'bookmark'

export interface CreatePlanDocument {
  name             : string
  type             : PlanType
  content          : string
  channel         ?: string
  user            ?: ObjectId | string
}

export interface ResponsePlanDocument extends Document {
  id               : number
  name             : string
  type             : PlanType
  content          : string
  channel          : string
  create_at        : Date
  share            : boolean
  share_user       : ResponseUserDocument[]
  share_at         : Date
  user             : ResponseUserDocument
  update_at        : Date
}

export interface EditPlanDocument {
  name            ?: string
  content         ?: string
  update_at       ?: Date
}

export interface SharePlanDocument {
  share           ?: boolean
  share_user      ?: Array<ObjectId | string>
  share_at        ?: Date
}

export interface Bookmark extends KeyMap<string> {
  command         ?: string
  children        ?: Bookmark[]
}