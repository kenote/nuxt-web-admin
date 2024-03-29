
import { WebSocketMessage } from './http'

export declare namespace PubsubConfigure {

  interface Service {
    name           : string
    service        : string
    args          ?: any[]
    defaultValues ?: any
    resultMaps    ?: string | Array<string | number>
  }
}

export declare interface PubsubConfigure {
  /**
   * 请求信息
   */
  request        : WebSocketMessage.Request
  /**
   * 返回数据
   */
  response       : Record<string, PubsubConfigure.Service>
}