import RPCClient from '@alicloud/pop-core'
import { loadConfig } from '@kenote/config'
import { AlicloudConfigure } from '@/types/config'
import ruleJudgment from 'rule-judgment'

/**
 * 请求选项
 */
 export const requestOption = {
  method: 'POST'
}

/**
 * 创建客户端
 * @param options 
 */
export function createClient (options: AlicloudConfigure.Options) {
  let { sdks, accessKeys } = loadConfig<AlicloudConfigure>('config/alicloud', { mode: 'merge' })
  let { endpoint, apiVersion, opts } = sdks.find( ruleJudgment({ key: options.sdk }) ) ?? {}
  let { accessKeyId, accessKeySecret } = accessKeys.find( ruleJudgment({ key: options.accessKey }) ) ?? {}
  let config: RPCClient.Config = { 
    accessKeyId: accessKeyId ?? '', 
    accessKeySecret: accessKeySecret ?? '', 
    endpoint: endpoint ?? '', 
    apiVersion: apiVersion ?? '', 
    opts 
  }
  return new RPCClient(config)
}

/**
 * 发送短信
 * @param phone 
 * @param SignName 
 * @param TemplateCode 
 * @param params 
 */
export function SendSms (PhoneNumbers: string, SignName: string, TemplateCode: string, params?: object) {
  return async (options: AlicloudConfigure.Options) => {
    let client = createClient(options)
    let TemplateParam = JSON.stringify(params ?? {})
    return client.request('SendSms', { PhoneNumbers, SignName, TemplateCode, TemplateParam }, requestOption)
  }
}

