/// <reference types="node" />

import { GroupDocument, CreateGroupDocument } from './services/db'

declare namespace NodeJS {
  interface Process {
    readonly browser: boolean
  }

  interface ProcessEnv {
    readonly NODE_ENV      : 'development' | 'production' | 'test'
    readonly HTTP_PORT    ?: string
  }
}

declare module '~/services/db/group' {

  /**
   * 创建新用户组
   * @param docs 
   */
  function create<T = GroupDocument> (docs: CreateGroupDocument): Promise<T>
  function create<T = GroupDocument> (docs: CreateGroupDocument[]): Promise<T[]>
}