import { Register, Security } from '@/types/restful'
import { ResponseTicketDocument } from '@/types/proxys/ticket'
import { RegisterUserDocument } from '@/types/proxys/user'

declare namespace PassportAPI {

  type verifyUserType = 'email' | 'mobile'
  type checkUserType = keyof checkWarning

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
    user        ?: string
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

  interface ticket {
    cdkey       ?: string
  }

  interface checkWarning {
    username     : number
    email        : number
    mobile       : number
  }

  interface checkValues {
    name         : string
    _id         ?: string
  }

  interface registerDocument {
    username    ?: string
    email       ?: string
    mobile      ?: string
    password    ?: string
    invitation  ?: string
  }

  interface register {
    document     : RegisterUserDocument
    ticket       : ResponseTicketDocument | null
    setting      : Register.config
  }

  interface verify {
    document     : verifyDocument
    warnings     : verifyWarning
    setting      : Register.config
  }

  interface verifyDocument extends verifyBaseDocument {
    type         : verifyUserType
  }

  interface verifyBaseDocument {
    id           : string
    token        : string
  }

  type verifyWarning = Record<string, verifyItem>

  interface verifyItem {
    timeout      : number
    failed       : number
  }

  // interface sendCode {
  //   document     : Security.sendCode
  //   setting      : Register.config
  // }

  interface request<T extends {}> {
    document     : T
    setting      : Register.config
  }
}

export = PassportAPI