

export declare namespace MailerContext {
  
  interface sendCode {
    title            ?: string
    site_name         : string
    username          : string
    code              : string
    timeout           : number
  }

  interface emailVerify {
    site_name         : string
    username          : string
    email_verify_url  : string
    timeout           : number
  }
}