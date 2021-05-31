import * as alicloud from './alicloud'
import { loadConfig } from '@kenote/config'

export interface SMSConfigure {
  type         : string
  sdk          : string
  accessKey    : string
  templates    : SMSTemplete
  signName     : string
}

export type SMSTemplete = Partial<Record<'register' | 'verifyid' | 'password' | 'setinfos', string>>

/**
 * 发送短信
 * @param phone 
 * @param template 
 * @param params 
 */
export async function sendSms (phone: string, template: keyof SMSTemplete, params?: object) {
  let { type, sdk, accessKey, templates, signName } = loadConfig<SMSConfigure>('config/sms', { mode: 'merge' })
  // 使用阿里云
  if (type === 'alicloud') {
    return await alicloud.SendSms(phone, signName, templates[template]!, params)({ accessKey, sdk })
  }
  return null
}