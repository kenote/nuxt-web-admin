import { Document } from 'mongoose'
import { ObjectId } from 'bson'


export declare interface TicketDocument extends Document {
  /**
   * 自动编号
   */
  id                   : number
  /**
   * 票据名称
   */
  name                 : string
  /**
   * 票据编号
   */
  cdkey                : string
  /**
   * 使用类型
   */
  type                 : string
  /**
   * 票据配置
   */
  setting              : object
  /**
   * 次数限制
   */
  stint                : number
  /**
   * 已使用次数
   */
  uses                 : number
  /**
   * 使用状态
   */
  used                 : boolean
  /**
   * 创建时间
   */
  create_at            : Date
  /**
   * 失效时间
   */
  last_at              : Date

}

export declare interface CreateTicketDocument {
  /**
   * 票据名称
   */
  name                 : string
  /**
   * 使用类型
   */
  type                 : string
  /**
   * 票据配置
   */
  setting              : object
  /**
   * 次数限制
   */
  stint                : number
  /**
   * 失效时间
   */
  last_at              : Date
}

export declare interface TicketOptions {
  /**
   * 票据名称
   */
  name                 : string
  /**
   * 使用类型
   */
  type                 : string
}