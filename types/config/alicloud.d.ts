import RPCClient from '@alicloud/pop-core'
import { BaseInfo } from '.'

export interface AlicloudConfigure {
  /**
   * SDK
   */
  sdks         : AlicloudConfigure.Sdk[]
  /**
   * 密钥
   */
  accessKeys   : AlicloudConfigure.AccessKey[]
}

export namespace AlicloudConfigure {

  /**
   * SDK 入口选项
   */
  interface Options {
    sdk               : string
    accessKey         : string
  }

  /**
   * SDK配置
   */
  interface Sdk extends BaseInfo {
    key               : string
    endpoint          : string
    apiVersion        : string
    opts             ?: object
  }

  /**
   * 密钥配置
   */
  interface AccessKey extends BaseInfo {
    key               : string
    accessKeyId       : string
    accessKeySecret   : string
  }
}