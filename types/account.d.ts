
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

  interface lostpass {
    code         ?: string
    password     ?: string
    repassed     ?: string
  }

  /**
   * 验证票据请求
   */
  interface ticket {
    cdkey        ?: string
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