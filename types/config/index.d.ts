export { ServerConfigure } from './server'
export { AccountConfigure } from './account'
export { AlicloudConfigure } from './alicloud'

export declare interface BaseInfo {
  /**
   * 名称
   */
  name                 : string
  /**
   * 描述
   */
  description         ?: string
}