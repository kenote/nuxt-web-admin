import validator from 'validator'
import { get } from 'lodash'

export function validateMobile (lang: validator.MobilePhoneLocale = 'zh-CN', unique: string | null, path: string | null, self?: Record<string, any>) {
  return async (rule: any, value: any, callback: (message?: string) => any) => {
    let valid = validator.isMobilePhone(value, lang)
    if (!valid) {
      return callback('请输入正确的手机号码，且不可使用虚拟手机号码')
    }
    if (unique) {
      let Iunique = get(self, 'unique')
      valid = await Iunique(value, path, unique)
    }
    if (!valid) {
      return callback('该手机号已绑定其他帐号')
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

export function validaterRepassed (password: string, self?: Record<string, any>) {
  return (rule: any, value: any, callback: (message?: string) => any) => {
    let Ipassword = password
    if (self) {
      Ipassword = get(self, ['values', password])
    }
    let valid = Ipassword === value
    if (!valid) {
      return callback('两次输入的密码不一致')
    }
    return callback()
  }
}

export function validateEmail (unique: string | null, path: string | null, self?: Record<string, any>) {
  return async (rule: any, value: any, callback: (message?: string) => any) => {
    let valid = validator.isEmail(value)
    if (!valid) {
      return callback('请输入正确的邮箱地址，如 example@163.com')
    }
    if (unique) {
      let Iunique = get(self, 'unique')
      let valid = await Iunique(value, path, unique)
      if (!valid) {
        return callback('该邮箱已绑定其他帐号')
      }
    }
    return callback()
  }
}

export function validateUsername (unique: string | null, path: string | null, self?: Record<string, any>) {
  return async (rule: any, value: any, callback: (message?: string) => any) => {
    let valid = /^[a-zA-Z]{1}[a-zA-Z0-9\_\-]/.test(value)
    if (!valid) {
      return callback('英文字符开头，支持小写英文、数字、下划线和中划线组合')
    }
    if (value.length > 20 || value.length < 5) {
      return callback('账号名限定 5 - 20 位字符')
    }
    if (unique) {
      let Iunique = get(self, 'unique')
      valid = await Iunique(value, path, unique)
      if (!valid) {
        return callback('该账号已注册')
      }
    }
    return callback()
  }
}

export function validateCDKey (name: string) {
  return (rule: any, value: any, callback: (message?: string) => any) => {
    let valid = validator.isUUID(value, 4)
    if (!valid) {
      return callback(`请输入正确的${ name }`)
    }
    return callback()
  }
}

export function validateDecimal () {
  return (rule: any, value: any, callback: (message?: string) => any) => {
    let valid = validator.isDecimal(value)
    if (!valid) {
      return callback('请输入正确的小写金额')
    }
    if (Number(value) > 100000000000) {
      return callback('金额过大，应小于1000亿元')
    }
    return callback()
  }
}