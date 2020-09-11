import { PBSetting } from 'kenote-socket-helper'
import { Maps, KeyMap } from 'kenote-config-helper'
import { Channel } from './channel'

export interface ProtoOptions {
  proto             : PBSetting
  rstps             : Maps<ProtoServer>
  release          ?: Maps<string>
}

export interface ProtoServer {
  host              : string
  port              : number
  name             ?: string
  description      ?: string
}

export interface UpdateSettingDocument {
  file             ?: string
  content           : string
}

export declare namespace ProtoSend {

  interface proto {
    code              : number
    req               : string
    res               : string
    rstp             ?: string
  }

  interface parse {
    key               : string
    separator         : string | RegExp
    fields           ?: string[]
    filter           ?: number[]
    collection       ?: KeyMap<string>[]
    orderBy          ?: orderBy
    int              ?: parseInt
    format           ?: string
    setBy            ?: string
    afterTrans       ?: Array<string | string[]>
    addedValue       ?: addedValue[]
  }

  interface orderBy {
    iteratees         : string[]
    orders            : Array<'asc' | 'desc'>
  }

  interface parseInt {
    key               : string
    function          : string
    options           : string[]
  }

  interface addedValue extends KeyMap<string> {
    defaultValue      : any
    options          ?: addedValueOptions
  }

  interface addedValueOptions {
    type              : string
    param             : string[]
    formula          ?: formula
  }

  interface formula {
    func              : Function
    opts              : string[]
  }

  interface alias {
    key               : string
    value             : string
    name             ?: string
  }

  interface document {
    setting           : ProtoOptions
    payload           : Maps<any>
    proto             : proto | Channel.api
    parse            ?: parse[]
    rtsp_key         ?: string
  }

  interface requestDocument {
    rtsp_key          : string
    rstp_serve        : string
    proto_code        : number
    payload           : Maps<any>
  }

  type request = Maps<'date' | 'string' | 'number' | 'array'>

  type autoFields = Record<'subtract' | 'add', Array<string | number>> & { reference: string }
}

export interface ProtoAPI {

  /**
   * 接口配置
   */
  proto             : ProtoSend.proto | Channel.api

  /**
   * 请求字段格式
   */
  request           : ProtoSend.request

  /**
   * 返回数据解析
   */
  parse            ?: ProtoSend.parse[]

  /**
   * 字段映射
   */
  alias            ?: Maps<ProtoSend.alias[]>

  /**
   * 自动生成字段
   */
  autoFields       ?: Maps<ProtoSend.autoFields>

  /**
   * 渠道选项
   */
  ditchOptions      ?: string[]

  /**
   * 提交附加参数
   */
  parameter         ?: Maps<any>

}