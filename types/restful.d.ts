import { Request } from 'express'
import { Channel } from './channel'


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
  }
}