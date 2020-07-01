import { KenoteConfig, Maps } from 'kenote-config-helper'
import { HeaderOptions } from '@/utils/http'

export declare namespace Channel {

  interface element extends KenoteConfig.Channel {
    navs              : navigation[]
  }

  interface navigation extends KenoteConfig.Navigation {
    columns          ?: columns[]
    queryer          ?: queryer[]
  }

  interface columns extends KenoteConfig.Columns {
    sortable         ?: boolean
    emit             ?: columnEmit[]
    align            ?: 'left' | 'center' | 'right'
    default          ?: string | number
    format           ?: format | format[]
    options          ?: columnOptions
  }

  interface columnEmit extends KenoteConfig.ColumnEmit {
    type             ?: string
    conditions       ?: any
    options          ?: any
  }

  interface queryer extends KenoteConfig.Queryer {
    api              ?: api
  }

  interface format extends KenoteConfig.Format {
    result           ?: string
  }

  interface api {
    method            : 'get' | 'post' | 'put'
    url               : string
    params           ?: any
    options          ?: HeaderOptions
    props             : Maps<any>
  }

  interface columnOptions {
    tooltip          ?: string
    template         ?: string
    status           ?: string[]
    conditions       ?: any
  }
}