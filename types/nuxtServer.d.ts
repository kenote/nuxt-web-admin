import { IncomingMessage } from 'http'
import Koa from 'koa'
import { RouterContext } from '@koa/router'
import { MetaInfo } from 'vue-meta'
import { NavMenu, Channel, EditorConfig } from './client'
import { AccountConfigure } from './config'
import { UserDocument } from './services/db'

export declare interface HTTPServer {
  req   : IncomingMessage & { $__payload: NuxtPayload, ctx: Koa.Context & RouterContext }
}

export declare interface NuxtPayload {
  site_url     ?: string
  baseHost      : string
  dashboard     : NavMenu.Configure
  channels      : Channel.DataNode[]
  metaInfo     ?: MetaInfo
  editorConfig  : EditorConfig
  account       : AccountConfigure
  getAuthInfo   : (token: string) => Promise<AuthInfo | null>
}

export declare interface AuthInfo {
  user         ?: UserDocument | null
}