import * as RPCClient from '@alicloud/pop-core'
import Alicloud, { SMS } from '@/types/alicloud'
import { oc } from 'ts-optchain'
import { isObject } from 'lodash'
import { mergeCollection } from '@/utils'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import logger from '~/utils/logger'

export default class Alicloud {

  private __Store: Alicloud.store
  private __Client?: RPCClient

  constructor (store: Alicloud.store) {
    this.__Store = store
    if (!oc(store).setting()) {
      logger.error('No configuration found for Alicound.')
      return
    }
    this.__Client = new RPCClient(store.setting)
  }

  public send (action: string, params: Object): Promise<any> {
    if (!this.__Client) return Promise.resolve(null)
    return this.__Client.request(action, params, { method: 'POST' })
  }

  public sendsms (phone: string | string[], template: SMS.template, param?: any): Promise<any> {
    let TemplateParam = isObject(param) ? JSON.stringify(param) : param as string
    let PhoneNumbers = Array.isArray(phone) ? phone.join(',') : phone
    let SignName = oc(this.__Store).SMS.signName('')
    let TemplateCode = oc(this.__Store).SMS.templates({})[template] || ''
    return this.send('SendSms', { PhoneNumbers, SignName, TemplateCode, TemplateParam })
  }
}

export function getAlicloundSetting () {
  let defaultSetting = loadData('config/alicloud/index.default.yml') as Alicloud.setting
  let setting = loadData('config/alicloud') as Alicloud.setting
  setting.apis = mergeCollection('key', setting.apis, defaultSetting.apis) as Alicloud.api[]
  return setting
}