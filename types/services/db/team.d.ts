import { Document } from 'mongoose'
import { ObjectId } from 'bson'

export declare interface TeamDocument extends Document {
  /**
   * 自动编号
   */
  id                   : number
  /**
   * 团队名称
   */
  name                 : string
  /**
   * 描述
   */
  description         ?: string
  /**
   * 频道权限
   */
  platform             : number[]
  /**
   * 页面权限
   */
  access               : string[]
  /**
   * Rstp 线路
   */
  rstps                : Record<string, string[]>
  /**
   * 是否超级团队
   */
  super                : boolean
  /**
   * 设置团长
   */
  owner               ?: string
}

export declare interface CreateTeamDocument extends EditTeamDocument {
  /**
   * 团队名称
   */
  name                 : string
}

export declare interface EditTeamDocument {
  /**
   * 团队名称
   */
  name                ?: string
  /**
   * 频道权限
   */
  description         ?: string
  /**
   * 是否超级团队
   */
  super               ?: boolean
  /**
   * 频道权限
   */
  platform            ?: number[]
  /**
   * 页面权限
   */
  access              ?: string[]
  /**
   * Rstp 线路
   */
  rtsps               ?: Record<string, string[]>
  /**
   * 设置团长
   */
  owner               ?: ObjectId | string
}