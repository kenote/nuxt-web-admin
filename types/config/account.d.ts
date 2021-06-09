import { ParseData } from 'parse-string'
import { FilterQuery } from '@kenote/common'
import { VerifyGenerateOptions } from '@/types/services/db/verify'
import { Channel } from '@/types/client'

export declare interface AccountConfigure {
  /**
   * 验证码发送间隔；单位：秒
   */
  mailphoneStep        : number
  /**
   * 验证码时效；单位：秒
   */
  mailphoneTime        : number
  /**
   * 邮箱验证配置
   */
  emailVerify          : AccountConfigure.emailVerify
  /**
   * 安全中心
   */
  security             : AccountConfigure.Security[]
}

export declare namespace AccountConfigure {

  /**
   * 邮箱验证配置
   */
  interface emailVerify {
    /**
     * 激活邮件时效；单位：秒
     */
    timeout              : number
    /**
     * 激活邮件地址
     */
    url                  : string
  }

  interface Security {
    /**
     * Key
     */
    key                  : string
    /**
     * 名称
     */
    name                 : string
    /**
     * 激活状态
     */
    success              : boolean | FilterQuery<any> | string
    /**
     * 描述
     */
    description          : SecurityConfigure.Description
    /**
     * 显示数据
     */
    data                ?: SecurityConfigure.Data
    /**
     * 禁用状态
     */
    disabled            ?: boolean | FilterQuery<any> | string
    /**
     * 指定按钮名称
     */
    buttonName          ?: string
    /**
     * 是否危险操作
     */
    danger              ?: boolean
    /**
     * 
     */
    title               ?: string
    /**
     * 表单选项
     */
    formOptions         ?: Channel.Form
  }
}

export declare namespace SecurityConfigure {

  type statusType = 'success' | 'warning' | 'info'
  type viewType = 'password' | 'email' | 'mobile' | 'remove' | 'overview'

  /**
   * 描述
   */
  type Description = {
    /**
     * 标题
     */
    title                : string
    /**
     * 多段内容
     */
    connect              : string[]
  } | string | string[]

  /**
   * 显示数据
   */
  interface Data {
    /**
     * 名称
     */
    name                 : string
    /**
     * 值
     */
    value               ?: string
    /**
     * 格式化
     */
    format               : ParseData.format | ParseData.format[]
    /**
     * 链接
     */
    link                ?: Link
  }

  /**
   * 链接信息
   */
  interface Link {
    /**
     * 显示条件
     */
    conditions          ?: FilterQuery<any> | string
    /**
     * 指令
     */
    command              : string
    /**
     * 提示文字
     */
    tooltip              : string
  }
}