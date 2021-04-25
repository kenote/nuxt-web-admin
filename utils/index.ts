
import nunjucks from 'nunjucks'
import { Command, Channel } from '@/types/client'
import { dataNodeProxy, FilterQuery } from '@kenote/common'
import { map, get, template, isDate } from 'lodash'
import jsYaml from 'js-yaml'

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
    let result = data
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
      { name: { $regex: new RegExp(keywords, 'i') } },
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

/**
 * 判断 Yaml 格式
 */
export function isYaml (str: string): boolean {
  try {
    return !!jsYaml.load(str)
  } catch (error) {
    return false
  }
}

/**
 * 解析成时间格式
 */
export function parseDate (value: string | Date) {
  if (isDate(value)) {
    return value
  }
  let data = {
    'now': new Date(),
    'today': new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
    'days': new Date().getDate(),
    'month': new Date().getMonth(),
    'year': new Date().getFullYear()
  }
  let result =  template(value, { interpolate: /{([\s\S]+?)}/g })(data)
  // tslint:disable-next-line: no-eval
  let time = eval(result)
  if (/(years)/.test(value)) {
    time = new Date().setFullYear(time, 0, 0)
  }
  else if (/(year)/.test(value)) {
    time = new Date().setFullYear(time)
  }
  else if (/(months)/.test(value)) {
    time = new Date().setMonth(time, 0)
  }
  else if (/(month)/.test(value)) {
    time = new Date().setMonth(time)
  }
  else if (/(days)/.test(value)) {
    time = new Date().setDate(time)
  }
  return new Date(time)
}