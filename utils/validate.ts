import validator from 'validator'

export function validateMobile (lang: validator.MobilePhoneLocale = 'zh-CN', unique?: (value: string, type: string) => Promise<boolean>) {
  return async (rule: any, value: any, callback: (message?: string) => any) => {
    let valid = validator.isMobilePhone(value, lang)
    if (!valid) {
      return callback('请输入正确的手机号码，且不可使用虚拟手机号码')
    }
    if (unique) {
      valid = await unique(value, 'mobile')
    }
    if (!valid) {
      return callback('该邮箱已绑定其他帐号')
    }
    return callback()
  }
}

export function validatePassword () {
  return (rule: any, value: any, callback: (message?: string) => any) => {
    let valid = /^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/.test(value)
    if (!valid) {
      return callback('密码支持 8 - 20 位的字母、数字和英文符号')
    }
    return callback()
  }
}

export function validaterRepassed (password: string) {
  return (rule: any, value: any, callback: (message?: string) => any) => {
    let valid = password === value
    if (!valid) {
      return callback('两次输入的密码不一致')
    }
    return callback()
  }
}

export function validateEmail (unique?: (value: string, type: string) => Promise<boolean>) {
  return async (rule: any, value: any, callback: (message?: string) => any) => {
    if (unique) {
      let valid = await unique(value, 'email')
      if (!valid) {
        return callback('该邮箱已绑定其他帐号')
      }
    }
    return callback()
  }
}

export function validateUsername (unique?: (value: string, type: string) => Promise<boolean>) {
  return async (rule: any, value: any, callback: (message?: string) => any) => {
    let valid = /^[a-zA-Z]{1}[a-zA-Z0-9\_\-]/.test(value)
    if (!valid) {
      return callback('英文字符开头，支持小写英文、数字、下划线和中划线组合')
    }
    if (value.length > 20 || value.length < 5) {
      return callback('账号名限定 5 - 20 位字符')
    }
    if (unique) {
      valid = await unique(value, 'email')
      if (!valid) {
        return callback('该账号已注册')
      }
    }
    return callback()
  }
}

export function validateCDKey (name: string) {
  return (rule: any, value: any, callback: (message?: string) =>any) => {
    let valid = validator.isUUID(value, 4)
    if (!valid) {
      return callback(`请输入正确的${ name }`)
    }
    return callback()
  }
}