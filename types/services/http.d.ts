import { Method } from '@kenote/common'
import { IncomingHttpHeaders } from 'http'

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