export { QueryOptions } from 'kenote-mongoose-helper'

export interface QueryDocument<T extends any> {
  conditions   : any
  options      : T
}

export interface UpdateDocument<T extends {}> {
  conditions   : any
  data         : T
}

export interface RemoveOptions {
  move        ?: string
}