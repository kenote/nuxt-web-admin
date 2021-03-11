


export declare namespace Account {

  interface login {
    username     ?: string
    password     ?: string
  }

  interface uuidResult<T> {
    uuid         ?: string
    result        : T
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