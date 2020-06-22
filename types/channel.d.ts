
import { KenoteConfig } from 'kenote-config-helper'

export declare namespace Channel {

  interface element extends KenoteConfig.Channel {
    navs              : navigation[]
  }

  interface navigation extends KenoteConfig.Navigation {
    columns          ?: columns[]
  }

  interface columns extends KenoteConfig.Columns {
    sortable         ?: boolean
    emit             ?: columnEmit[]
    align            ?: 'left' | 'center' | 'right'
  }

  interface columnEmit extends KenoteConfig.ColumnEmit {
    type             ?: string
    conditions       ?: any,
    options          ?: any
  }
}