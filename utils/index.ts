
import nunjucks from 'nunjucks'
import { Command, Channel, Verify } from '@/types/client'
import { dataNodeProxy, FilterQuery } from '@kenote/common'
import { map, get, template, isDate, isString, isArray, merge, isFunction } from 'lodash'
import jsYaml from 'js-yaml'
import urlParse from 'url-parse'
import qs from 'query-string'
import * as validate from './validate'
import Vue from 'vue'

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

/**
 * 获取 URL 附带时间戳
 */
export function getUrl (url: string, params?: Record<string, string>) {
  let { origin, pathname, query } = urlParse(url)
  let queryStr = query as unknown as string ?? ''
  let payload = {
    ...qs.parse(queryStr),
    ...params,
    t: String(Date.now())
  }
  return `${origin}${pathname}?${qs.stringify(payload)}`
}

/**
 * 解析参数
 */
 export function parseParams (params: any) {
  return (data?: Record<string, any>) => {
    let str = isString(params) ? params : jsYaml.safeDump(params)
    let val = nunjucks.renderString(str, data ?? {})
    return jsYaml.load(val)
  }
}

/**
 * 解析验证规则
 */
export function parseRules (rules: Record<string, Verify.Rule[]>, self?: Record<string, any>) {
  if (!rules) return rules
  for (let [key, rule] of Object.entries(rules)) {
    rules[key] = rule.map( item => {
      if (item.validator && isArray(item.validator)) {
        let [ name, ...props ] = item.validator
        let validator = get(validate, name as string)
        if (validator) {
          return merge(item, { validator: validator(...props, self) })
        }
      }
      return item
    })
  }
  return rules
}

/**
 * 运行指令
 * @param value 
 */
export function runCommand (self: Vue, commands?: Record<string, Function>) {
  return (value: string) => {
    let command = parseCommand(value)
    if (!command) return
    if (command.type === 'command') {
      let [ name, ...props ] = command.path.split('|')
      let runScript = get(commands ?? self, name)
      if (isFunction(runScript)) {
        runScript(...props)
      }
    }
    else if (command.type === 'router') {
      if (!self?.$router) return
      self.$router.push(command.path)
    }
    else if (command.type === 'http') {
      if (!document) return
      let link = document.createElement('a')
      let [ href, target ] = command.path.split('|')
      link.href = href
      if (target) {
        link.target = target
      }
      link.click()
    }
  }
}