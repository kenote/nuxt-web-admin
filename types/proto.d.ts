import { PBSetting } from 'kenote-socket-helper'
import { Maps } from 'kenote-config-helper'

export interface ProtoOptions {
  proto        : PBSetting
  rstps        : Maps<ProtoServer>
  release     ?: Maps<string>
}

export interface ProtoServer {
  host         : string
  port         : number
  name        ?: string
  description ?: string
}

export interface UpdateSettingDocument {
  file        ?: string
  content      : string
}