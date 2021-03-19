


export declare namespace Command {

  type type = 'command' | 'router' | 'http'

  interface value {
    type     : type
    path     : string
  }
}

export declare namespace NavMenu {

  interface DataItem {
    key           ?: string
    name           : string
    description   ?: string
    link          ?: string
    buttons       ?: DataItem[]
  }

  interface RootDataItem extends DataItem {
    type          ?: 'link' | 'dropdown' | 'notification'
    data          ?: Array<DataItem>
    props         ?: Record<string, string>
    trigger       ?: 'hover' | 'click'
    more          ?: MoreItem
  }

  interface Configure {
    navmenu        : NavMenu.RootDataItem[]
    authpanel      : AuthPanel
  }

  interface MoreItem {
    name          ?: string
    link          ?: string
  }

  interface AuthPanel {
    trigger       ?: 'hover' | 'click'
    top           ?: DataItem[]
    main          ?: DataItem[]
    exit          ?: DataItem
  }
}
