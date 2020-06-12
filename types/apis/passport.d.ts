import { Register } from '@/types/restful'

declare namespace PassportAPI {

  type verifyUserType = 'email' | 'mobile'

  interface login {
    username    ?: string
    password    ?: string
  }

  interface password {
    hash         : string
    salt         : string
  }

  interface inputValue {
    name        ?: string
  }

  interface verifyUser {
    type         : verifyUserType
    email        : inputValue
    mobile       : inputValue
  }

  interface verifyUserRequest {
    type         : verifyUserType
    name         : string
  }

  interface resetPwdDocument {
    code        ?: string
    name        ?: string
    password    ?: string
  }

  interface restPwd {
    type         : verifyUserType
    document     : resetPwdDocument
    setting      : Register.config
  }

  interface lostpass {
    code        ?: string
    password    ?: string
    repassed    ?: string
  }
}

export = PassportAPI