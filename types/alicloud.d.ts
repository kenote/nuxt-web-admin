import * as RPCClient from '@alicloud/pop-core'
import { KeyMap } from 'kenote-config-helper'

declare namespace Alicloud {

  interface store {
    key              ?: string
    name             ?: string
    description      ?: string
    setting           : RPCClient.Config
    SMS              ?: SMS.config
  }

  interface setting {
    accessKeys        : accessKey[]
    apis              : api[]
    SMS              ?: SMS.config[]
  }

  interface accessKey extends KeyMap<string> {
    options           : accessKeyOptions
  }

  interface accessKeyOptions {
    accessKeyId       : string
    secretAccessKey   : string
  }

  interface api extends KeyMap<string> {
    endpoint          : string
    apiVersion        : string
    accessKeys       ?: string[]
  }

  interface document {
    config            : RPCClient.Config
    action            : string
    params            : any
  }
}

export default Alicloud

export declare namespace SMS {

  type template = keyof templates

  interface config {
    key               : string
    signName          : string
    templates         : templates
  }

  interface templates {
    register         ?: string
    verifyid         ?: string
    password         ?: string
    setinfos         ?: string
  }

  interface requestParams {
    PhoneNumbers      : string
    SignName          : string
    TemplateCode      : string
    TemplateParam    ?: string
  }
}