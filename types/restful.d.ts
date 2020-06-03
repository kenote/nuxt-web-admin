import { Request } from 'express'
import { Channel } from './channel'
import { IErrorInfo } from 'kenote-config-helper'

/**
 * HTTPServer
 */
export interface HTTPServer {

  /**
   * Request
   */
  req          : NuxtTypes.request
}

export declare namespace NuxtTypes {

  interface request extends Request {
    __name       : string
    __channels   : Channel.element[]
    /**
     * Proxy Host
     */
    __proxyhost  : string
  }
}

export interface RestfulInfo {
  data         : any
  Status       : IErrorInfo
}

export interface RestfulInfoByError {
  data         : any
  error        : number
  message      : string
}