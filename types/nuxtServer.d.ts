import { IncomingMessage } from 'http'
import Koa from 'koa'
import { RouterContext } from '@koa/router'
import { NavMenu } from './client'

export declare interface HTTPServer {
  req   : IncomingMessage & { $__payload: NuxtPayload, ctx: Koa.Context & RouterContext }
}

export declare interface NuxtPayload {
  site_url     ?: string
  baseHost      : string
  dashboard     : NavMenu.Configure
}