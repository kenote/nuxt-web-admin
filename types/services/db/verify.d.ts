import { Document } from 'mongoose'
import { ObjectId } from 'bson'
import { UserDocument } from './user'
import { UpdateWriteResult } from '@kenote/mongoose'

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

export interface CreateVerifyDocument extends EditVerifyDocument {
  
}

export interface EditVerifyDocument {
  _id                 ?: ObjectId | string
  /**
   * 验证类型
   */
  type                ?: VerifyType
  /**
   * 密钥
   */
  token               ?: string
  /**
   * 关联用户
   */
  user                ?: ObjectId | string
  /**
   * 是否已校验
   */
  approved            ?: boolean
  /**
   * 
   */
  application         ?: string
  /**
   * 创建时间
   */
  create_at           ?: Date
  /**
   * 更新时间
   */
  update_at           ?: Date
}

export interface VerifyGenerateOptions {
  name                ?: string
  verify_id           ?: string | null
}

export interface UpdateVerifyResult extends UpdateWriteResult {
  token          : string
  _id            : string
}