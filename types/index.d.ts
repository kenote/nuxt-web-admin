
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

export declare namespace Execl {

  interface Options {
    header            : string[]
    data              : any[]
    sheetName        ?: string
    bookType         ?: BookType
    filename         ?: string
  }

  interface FileType {
    key               : BookType
    name              : string
    suffix            : '.xlsx' | '.xlsm' | '.xlsb' | '.xls' | '.csv' | '.txt' | '.html'
  }

  type BookType = 'xlsx' | 'xlsm' | 'xlsb' | 'biff8' | 'csv' | 'txt' | 'html'
}