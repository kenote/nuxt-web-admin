
import nunjucks from 'nunjucks'
import { Command, Channel } from '@/types/client'
import { dataNodeProxy, FilterQuery } from '@kenote/common'
import { map, get } from 'lodash'

/**
 * 解析命令指向
 * @param value 
 */
export function parseCommand (value: string): Command.value | null {
  if (!value) return null
  let command = value.match(/^(command|router|https?)\:(\S+)$/)
  if (!command) return null
  let [ , type, path ] = command
  if (/^(https?)/.test(type)) {
    return { type: 'http', path: value }
  }
  return { type, path } as Command.value
}

/**
 * 映射对象
 * @param props 
 */
export function parseProps (props?: Record<string, string>) {
  return (data: Record<string, any>) => {
    if (!props) return data
    let result = {}
    for (let [key, val] of Object.entries(props)) {
      result[key] = /(\{)/.test(val) ? nunjucks.renderString(val, data) : get(data, val)
    }
    return result
  }
}

/**
 * 检索数据节点，结果返回到列表
 * @param data 
 * @param keywords 
 * @param list 
 */
export function filterDataNode (data: Channel.DataNode[], keywords: string, list: Channel.DataNode[] = []) {
  if (!keywords) return
  let keys = map(list, 'key')
  let query: FilterQuery<Channel.DataNode> = {
    $or: [
      { name: { $regex: new RegExp(keywords) } },
      { keywords: { $_in: [ keywords.toLocaleLowerCase() ] } }
    ]
  }
  let item = dataNodeProxy<Channel.DataNode>(data).find({ $and: [ { key: { $nin: keys } }, query, { children: { $exists: false } } ] })
  if (item) {
    list.push(item)
    filterDataNode(data, keywords, list)
  }
  return
}