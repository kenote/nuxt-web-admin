import RPCClient from '@alicloud/pop-core'
import { BaseInfo } from '.'
import { FilterData, ParseData } from 'parse-string'

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

export interface APIOptions {
  filter            : FilterData.options[]
  props            ?: Record<string, string>
  sortOptions      ?: SortOptions
  resultProps      ?: Record<string, string>
}

interface SortOptions {
  name              : string
  fields            : SortField[]
}

interface SortField {
  key               : 'orderByKey' | 'orderByType'
  name              : string
  format           ?: ParseData.format[]
}

export interface NextPayload {
  accessKey         : string
  sdk               : string
  action            : string
  options           : ResponseOptions
  payload          ?: Record<string, any>
}

interface ResponseOptions {
  resultProps      ?: Record<string, string>
}