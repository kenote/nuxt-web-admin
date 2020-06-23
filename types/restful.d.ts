import { Request } from 'express'
import { Channel } from './channel'
import { IErrorInfo, Maps } from 'kenote-config-helper'
import { Dropdown } from './'
import * as PassportAPI from './apis/passport'
import { VerifyGenerateOptions } from '@/types/proxys/verify'

/**
 * HTTPServer
 */
export interface HTTPServer {

  /**
   * Request
   */
  req          : NuxtTypes.request
}

export declare namespace NuxtTypes {

  interface request extends Request {
    __name       : string
    __channels   : Channel.element[]

    /**
     * Proxy Host
     */
    __proxyhost           : string

    /**
     * 注册配置
     */
    __register            : Register.config

    /**
     * 独立页面配置
     */
    __singlePages         : SinglePage.item[]

    /**
     * 页面权限配置
     */
    __flags               : Maps<PageFlag.item>
    
    /**
     * 仪表盘选项
     */
    __dashboard           : DashboardOptions
  }
}

export interface RestfulInfo {
  data         : any
  Status       : IErrorInfo
}

export interface RestfulInfoByError {
  data         : any
  error        : number
  message      : string
}

export declare namespace Register {

  interface config {

    /**
     * 是否需要邀请才能注册
     */
    invitation       : boolean

    /**
     * 验证码发送间隔；单位：秒
     */
    mailphone_step   : number

    /**
     * 邮件验证
     */
    email_verify     : emailVerify

    /**
     * 找回密码
     */
    lost_pass        : lostPass

    /**
     * 页面标题
     */
    page_title       : Maps<string>

    /**
     * 安全中心概观
     */
    security         : Security.overview[]
  }

  interface emailVerify {

    /**
     * 激活邮件时效；单位：秒
     */
    timeout          : number
  }

  interface lostPass {

    /**
     * 验证码时效；单位：秒
     */
    timeout           : number
  }
}

export declare namespace Security {

  type statusType = 'success' | 'warning' | 'info'
  type statusIcon = 'el-icon-success success' | 'el-icon-warning warning' | 'el-icon-info info'
  type viewType = 'password' | 'email' | 'mobile' | 'overview'

  interface overview {
    key              : string
    type             : statusType
    name             : string
    icon             : statusIcon
    data            ?: overviewData
    description      : string | string[] | description
    click           ?: () => void
  }

  interface description {
    title            : string
    content          : string[]
  }

  interface overviewData {
    name             : string
    value           ?: string
    format          ?: Array<string | RegExp>
  }

  interface verifyCode {
    code            ?: string,
    user            ?: string
  }

  interface setPassword {
    password         : string
    verify_id       ?: string | null
  }

  interface setEmail {
    email            ?: string
    code             ?: string
    verify_id       ?: string | null
  }

  interface setMobile {
    mobile           ?: string
    code             ?: string
    verify_id       ?: string | null
  }

  interface sendCode extends VerifyGenerateOptions {
    type              : PassportAPI.verifyUserType
  }
}

export declare namespace SinglePage {

  interface item extends Maps<any> {
    key               : string
    activitys         : activity[]
  }

  interface activity {
    main_title        : string[]
    secondary_title   : string
  }
}

export declare namespace PageFlag {
  
  type type = keyof item

  interface item {
    access           ?: number
    list             ?: number
    create           ?: number
    edit             ?: number
    remove           ?: number
  }
}

export interface DashboardOptions {
  userEntrance       ?: DashboardOptions.userEntrance
  disableMode         : DashboardOptions.disableMode
}

export declare namespace DashboardOptions {

  type userEntrance = Dropdown.menuItem[]
  type disableMode = 'hide' | 'disable'
}