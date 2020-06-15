import { Document } from 'mongoose'
import { ObjectId } from 'bson'

export interface CreateTicketDocument {
  name           : string
  type           : string
  setting        : object
  stint          : number
  last_at        : Date
}

export interface ResponseTicketDocument extends Document {
  id             : number
  name           : string
  cdkey          : string
  type           : string
  setting        : object
  stint          : number
  uses           : number
  used           : boolean
  create_at      : Date
  last_at        : Date
}

export interface TicketOptions {
  name           : string
  type           : string
  key            : string
}

export interface EditTicketDocument {
  stint          : number
  last_at        : Date
}