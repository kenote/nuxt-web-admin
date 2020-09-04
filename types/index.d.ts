import { ResponsePlanDocument, PlanType } from '@/types/proxys/plan'
import { UpdateWriteResult, DeleteWriteResult } from 'kenote-mongoose-helper'
import { Maps, KeyMap } from 'kenote-config-helper'
import { HeaderOptions } from '@/utils/http'

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

  type type = 'command' | 'router' | 'http'

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

export interface PlanOptions {
  pid               : number
  get               : (type: PlanType, next: (doc: ResponsePlanDocument[]) => void) => void
  create            : (type: PlanType, name: string, value: any, next: (doc: ResponsePlanDocument) => void) => void
  update            : (_id: string, name: string, value: any, next: (doc: UpdateWriteResult) => void) => void
  remove            : (_id: string, next: (doc: DeleteWriteResult) => void) => void
}

export interface DitchOptions {
  plan              : PlanOptions
}

export declare namespace Poller {

  type status = 'success' | 'failure' | 'performed' | 'waiting'

  interface task extends Maps<any>, KeyMap<string> {
    key               : string
    status            : status
    size              ?: number
    time              ?: number
    options           ?: HeaderOptions
    params            ?: Maps<any>
  }
}