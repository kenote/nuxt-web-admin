import { KenoteConfig, Maps } from 'kenote-config-helper'
import { HeaderOptions } from '@/utils/http'
import { Option } from '@/types'

export declare namespace Channel {

  interface element extends KenoteConfig.Channel {
    navs              : navigation[]
  }

  interface navigation extends KenoteConfig.Navigation {
    columns          ?: columns[]
    queryer          ?: queryer[]
    export           ?: Export
    rangeDate        ?: 'month' | 'day'
    draft            ?: boolean
  }

  interface columns extends KenoteConfig.Columns {
    sortable         ?: boolean
    emit             ?: columnEmit[]
    align            ?: 'left' | 'center' | 'right'
    default          ?: string | number
    format           ?: format | format[]
    options          ?: columnOptions
    tags             ?: tags
  }

  interface columnEmit extends KenoteConfig.ColumnEmit {
    type             ?: string
    conditions       ?: any
    options          ?: any
    multiple         ?: boolean
  }

  interface queryer extends KenoteConfig.Queryer {
    api              ?: api
    label            ?: queryLabelOptions
    border           ?: boolean
  }

  interface format extends KenoteConfig.Format {
    result           ?: string
  }

  interface api {
    method            : 'get' | 'post' | 'put'
    url               : string
    params           ?: any
    options          ?: HeaderOptions
    props            ?: Maps<any>
  }

  interface columnOptions {
    tooltip          ?: string
    template         ?: string
    status           ?: string[]
    conditions       ?: any
  }

  interface queryLabelOptions {
    key               : string
    options           : Maps<string>
    value             : string
  }

  interface Export {
    sheetName        ?: string
    conditions       ?: any
  }

  interface tags {
    group             : string
    separator         : string
  }
}