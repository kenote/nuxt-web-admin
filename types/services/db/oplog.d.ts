import { Document } from 'mongoose'
import { ObjectId } from 'bson'
import { Method } from '@kenote/common'
import { IncomingHttpHeaders } from 'http'
import { UserDocument } from './user'

export declare interface OplogDocument extends Document {
  /**
   * 自动编号
   */
  id                   : number
  /**
   * 操作类型
   */
  type                 : string
  /**
   * 操作描述
   */
  content             ?: string
  /**
   * 操作 IP
   */
  ip                   : string
  /**
   * 操作 API
   */
  api                  : Oplog.API
  /**
   * 操作用户
   */
  user                ?: UserDocument
  /**
   * 操作时间
   */
  create_at            : Date
}

export interface CreateOplogDocument {
  type                 : string
  content             ?: string
  ip                  ?: string
  api                 ?: Oplog.API
  user                ?: ObjectId | string
  create_at           ?: Date
}

export declare namespace Oplog {

  interface API {
    address         : string
    request         : Request
    response        : Response
  }

  interface Request {
    originalUrl     : string
    method          : Method | string
    headers         : IncomingHttpHeaders
    body           ?: any
  }

  interface Response {
    data           ?: any
    error          ?: string
  }

  interface APINodeItem {
    key             : string
    type            : string
    name            : string
    method          : string[]
    url             : string
    regexp          : RegExp
  }

  interface System {
    filename        : string
    mime            : string
    size            : number
    start           : Date
    end             : Date
  }
}




