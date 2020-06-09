import AlicloudClient, { getAlicloundSetting } from './alicloud'
import Alicloud, { SMS } from '@/types/alicloud'
import { oc } from 'ts-optchain'

export class DYSMS {
  
  private __Store: Alicloud.store

  constructor (name: string) {
    this.__Store = getAlicloudStore(name)
  }

  public send = (phone: string | string[], template: SMS.template, param?: any) => new AlicloudClient(this.__Store).sendsms(phone, template, param)
}

function getAlicloudStore (name: string): Alicloud.store {
  let setting = getAlicloundSetting()
  let accessKeys = setting.accessKeys.find( o => o.key === name )
  let api = setting.apis.find( o => o.key === 'dysms' )
  let smsConfig = oc(setting).SMS([]).find( o => o.key === name )
  return {
    key: name,
    name: oc(accessKeys).name(''),
    setting: {
      accessKeyId: oc(accessKeys).options.accessKeyId(''),
      accessKeySecret: oc(accessKeys).options.secretAccessKey(''),
      endpoint: oc(api).endpoint(''),
      apiVersion: oc(api).apiVersion('')
    },
    SMS: smsConfig
  }
}