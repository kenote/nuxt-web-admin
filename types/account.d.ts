
import { VerifyGenerateOptions } from '@/types/services/db/verify'

export declare namespace Account {

  type verifyUserType = 'email' | 'mobile'

  /**
   * 用户登录
   */
  interface login {
    username     ?: string
    password     ?: string
  }

  interface uuidResult<T> {
    uuid         ?: string
    result        : T
  }

  interface inputValue {
    name         ?: string
  }

  /**
   * 验证用户选项
   */
  interface verifyUser {
    type          : verifyUserType
    email         : inputValue
    mobile        : inputValue
  }

  /**
   * 验证验证码
   */
  interface verifyCode {
    code         ?: string
    user         ?: string
  }

  /**
   * 验证用户真实性
   */
  interface verifyUserRequest {
    type          : verifyUserType
    name          : string
    verify_id    ?: string
  }

  /**
   * 找回密码
   */
  interface lostpass {
    code         ?: string
    password     ?: string
    repassed     ?: string
  }

  /**
   * 注册用户
   */
  interface register {
    username     ?: string
    email        ?: string
    password     ?: string
    invitation   ?: string
  }

  type verifyEmailMobile<T = {}> = {
    token         : string
    _id           : string
  } & T

  /**
   * 验证票据请求
   */
  interface ticket {
    cdkey        ?: string
    name         ?: string
    type         ?: string
  }

  /**
   * 发送验证码
   */
  interface sendCode extends VerifyGenerateOptions {
    type          : verifyUserType
  }

  /**
   * 设置安全信息
   */
  type upInfo<T>  = {
    code            ?: string
    verify_id       ?: string | null
  } & T
}