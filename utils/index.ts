// Utils...
import { Maps } from 'kenote-config-helper'
import { MetaInfo } from 'vue-meta'
import { oc } from 'ts-optchain'
import { Command } from '@/types'
import { assign } from 'lodash'

export function getMetaInfo (data: Maps<string | undefined>, metas?: any[]): MetaInfo {
  let metaInfo: MetaInfo = {
    title: oc(data).title(),
    meta: metas || []
  }
  if (oc(data).keywords()) {
    metaInfo.meta!.push({ hid: 'keywords', name: 'keywords', content: oc(data).keywords('') })
  }
  if (oc(data).description()) {
    metaInfo.meta!.push({ hid: 'description', name: 'description', content: oc(data).description('') })
  }
  return metaInfo
}

/**
 * 解析菜单命令
 * @param value string
 */
export function parseCommand (value: string): Command.value | null {
  if (!value) return null
  let command = value.match(/^(command|router)\:(\S+)$/)
  if (!command) return null
  let [ , type, path ] = command
  return { type: type as Command.type, path }
}

/**
 * 将多个集合进行参数合并
 * @param fields string
 * @param collections Array<Maps<any>>
 */
export function mergeCollection (fields: string, ...collections: Array<Maps<any>>): Array<Maps<any>> {
  let collection = [].concat(...collections as Array<ConcatArray<never>>)
  let newCollection = [] as Object[]
  for (let item of collection) {
    let items = collection.filter( o => o[fields] === item[fields] )
    let is_push = !newCollection.find( o => o[fields] === item[fields] )
    is_push && newCollection.push(assign({}, ...items))
  }
  return newCollection
}