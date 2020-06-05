

declare namespace PassportAPI {

  interface login {
    username    ?: string
    password    ?: string
  }

  interface password {
    hash         : string
    salt         : string
  }
}

export = PassportAPI