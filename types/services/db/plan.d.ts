import { Document } from 'mongoose'
import { ObjectId } from 'bson'
import { UserDocument } from './user'
import { CommonDataNode } from '@kenote/common'

export type PlanType = 'bookmark' | 'draft'

export declare interface PlanDocument extends Document {
  /**
   * 自动编号
   */
  id                   : number
  /**
   * 名称
   */
  name                 : string
  /**
   * 类型
   */
  type                 : PlanType
  /**
   * 内容
   */
  content              : string
  /**
   * 用户
   */
  user                 : UserDocument
  /**
   * 创建时间
   */
  create_at            : Date
  /**
   * 更新时间
   */
  update_at            : Date
  /**
   * 关联
   */
  associate            : string
}

export interface CreatePlanDocument extends EditPlanDocument {
  name                : string
  type                : PlanType
  content             : string
  user                : ObjectId | string
  associate          ?: string
}

export interface EditPlanDocument {
  name                ?: string
  content             ?: string
  update_at           ?: Date
}

export interface BookmarkDataNode extends CommonDataNode {
  command             ?: string
}