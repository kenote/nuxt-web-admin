


export declare namespace Account {

  type verifyUserType = 'email' | 'mobile'

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

  interface verifyUser {
    type          : verifyUserType
    email         : inputValue
    mobile        : inputValue
  }

  interface verifyUserRequest {
    type          : verifyUserType
    name          : string
  }

  interface ticket {
    cdkey        ?: string
  }
}

export declare interface AccountConfigure {
  /**
   * 最多绑定账号数
   */
  max_binds: Record<string, number>
}


export declare namespace AccountConfigure {

  
}