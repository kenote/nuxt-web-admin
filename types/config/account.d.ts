
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
}

export declare namespace AccountConfigure {

  /**
   * 邮箱验证配置
   */
  interface emailVerify {
    /**
     * 激活邮件时效；单位：秒
     */
    timeout    : number
    /**
     * 激活邮件地址
     */
    url        : string
  }
}