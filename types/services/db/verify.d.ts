import { Document } from 'mongoose'
import { ObjectId } from 'bson'
import { UserDocument } from './user'

export type VerifyType = 'email' | 'mobile' | 'code' | 'login'

export interface VerifyDocument extends Document {
  /**
   * 自动编号
   */
  id                   : number
  /**
   * 验证类型
   */
  type                 : VerifyType
  /**
   * 密钥
   */
  token                : string
  /**
   * 关联用户
   */
  user                ?: UserDocument
  /**
   * 是否已校验
   */
  approved             : boolean
  /**
   * 
   */
  application          : string
  /**
   * 创建时间
   */
  create_at            : Date
  /**
   * 更新时间
   */
  update_at            : Date
}

export interface CreateVerifyDocument {
  /**
   * 验证类型
   */
  type                 : VerifyType
  /**
   * 关联用户
   */
  user                ?: ObjectId | string
  /**
   * 密钥
   */
  token               ?: string
  /**
   * 
   */
  application         ?: string
}