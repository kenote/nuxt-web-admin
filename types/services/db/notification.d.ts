import { Document } from 'mongoose'
import { ObjectId } from 'bson'
import { UserDocument } from './user'

export declare interface NotificationDocument extends Document {
  /**
   * 自动编号
   */
  id                   : number
  /**
   * 标题
   */
  title                : string
  /**
   * 内容
   */
  content              : string
  /**
   * 是否已读
   */
  readed               : Array<ObjectId | string>
  /**
   * 移除标记
   */
  removed              : Array<ObjectId | string>
  /**
   * 接收人
   */
  receiver             : UserDocument[]
  /**
   * 消息分类
   */
  type                 : string
  /**
   * 创建时间
   */
  create_at            : Date
  /**
   * 更新时间
   */
  update_at            : Date
  /**
   * 发布状态
   */
  release               : boolean
}

export declare interface AccoutNotificationDocument {
  _id                   : ObjectId | string
  /**
   * 自动编号
   */
   id                   : number
   /**
    * 标题
    */
   title                : string
   /**
    * 内容
    */
   content              : string
   /**
    * 是否已读
    */
   readed              ?: boolean
   /**
    * 消息分类
    */
   type                 : string
   /**
    * 更新时间
    */
   update_at            : Date
}

export declare interface CreateNotificationDocument extends EditNotificationDocument {
  /**
   * 标题
   */
  title                : string
  /**
  * 内容
  */
  content              : string
  /**
   * 消息分类
   */
  type                 : string
}

export declare interface EditNotificationDocument {
  /**
   * 标题
   */
  title                : string
  /**
  * 内容
  */
  content              : string
  /**
   * 接收人
   */
  receiver            ?: Array<ObjectId | string>
  /**
   * 消息分类
   */
  type                 : string
  /**
   * 是否已读
   */
  readed              ?: Array<ObjectId | string>
  /**
   * 移除标记
   */
  removed              : Array<ObjectId | string>
  /**
   * 更新/发布时间
   */
  update_at           ?: Date
  /**
   * 发布状态
   */
  release              : boolean
}