
export interface Option {
  key               : number | string
  label             : string
  disabled         ?: boolean
}

export declare namespace Dropdown {

  interface menuItem {
    name              : string
    command          ?: string
  }
}

export declare namespace Sidebar {

  interface menuItem {
    index             : string
    name              : string
    icon             ?: string
    children         ?: menuItem[]
    disabled         ?: boolean
  }
}

export declare namespace Command {

  type type = 'command' | 'router'

  interface value {
    type              : type
    path              : string
  }
}