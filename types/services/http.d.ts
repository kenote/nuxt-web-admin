import { Method } from '@kenote/common'
import { IncomingHttpHeaders } from 'http'
import { UserDocument } from './db'

export interface HttpRequest {
  method       : Method
  url          : string
  headers     ?: IncomingHttpHeaders
  params      ?: NodeJS.Dict<any>
  body        ?: NodeJS.Dict<any>
}
  
export interface HttpResponse {
  body        ?: string
  headers     ?: string[]
  status      ?: string
}

export declare namespace WebSocketMessage {

  interface Request {
    headers    : RequestHeaders
    payload   ?: Record<string, any>
    auth      ?: UserDocument | null
  }

  interface Response {
    headers    : ResponseHeaders
    body       : any
  }

  type RequestHeaders = IncomingHttpHeaders & { 
    path       : string 
  }

  interface ResponseHeaders {
    timestamp  : number
    path       : string
    payload   ?: Record<string, any>
  }
}