
import nunjucks from 'nunjucks'
import { Command, Channel, Verify } from '@/types/client'
import { dataNodeProxy, CommonDataNode } from '@kenote/common';
import { map, get, template, isDate, isString, isArray, merge, isFunction, isPlainObject, omit, isNumber, toNumber, isNaN, isEmpty, isNull, compact, cloneDeep } from 'lodash'
import jsYaml from 'js-yaml'
import urlParse from 'url-parse'
import qs from 'query-string'
import * as validate from './validate'
import Vue from 'vue'
import ruleJudgment, { FilterQuery, emit } from 'rule-judgment'
import dayjs from 'dayjs'
import { ParseData, formatData, toValue } from 'parse-string'
import bytes from 'bytes'

export const customize = {
  // 格式化日期时间
  dateFormat: (date: any, format: string = 'YYYY-MM-DD') => dayjs(date).format(format),
  bytes
}

/**
 * 格式化字符串
 * @param value 
 * @param format 
 * @param replace 
 */
export function formatString (value: any, format?: ParseData.format | ParseData.format[], replace?: string | number) {
  if (!value && value !== 0) return replace ?? value
  if (!format) return value
  return formatData(format, customize)(value)
}

/**
 * 解析模版
 * @param tpl 
 * @param context 
 */
export function parseTemplate (tpl: string, context: object) {
  let env = new nunjucks.Environment(null, { autoescape: false })
  env.addFilter(parseDate.name, value => String(parseDate(value))) // 解析时间字面量
  env.addFilter(parseContent.name, value => String.raw`${parseContent(value, context)}` ) // 解析时间字面量
  return env.renderString(tpl, context)
}

/**
 * 解析命令指向
 * @param value 
 */
export function parseCommand<T> (value: string, tag?: string): Command.value<T> | null {
  if (!value) return null
  let tags = compact([ 'dialog', 'action', 'command', 'router', 'https?', tag ]).join('|')
  let regex = new RegExp(`^(${tags})\\:(\\S+)$`)
  let command = value.match(regex)
  if (!command) return null
  let [ , type, path ] = command
  if (/^(https?)/.test(type)) {
    return { type: 'http', path: value }
  }
  return { type, path } as Command.value<any>
}

/**
 * 映射对象
 * @param props 
 */
export function parseProps (props?: Record<string, string>) {
  return (data: Record<string, any>) => {
    if (!props) return data
    let result = data
    let keys: string[] = []
    for (let [key, val] of Object.entries(props)) {
      result[key] = /(\{)/.test(val) ? nunjucks.renderString(val, data) : get(data, val)
      if (key !== val) {
        keys.push(val)
      }
    }
    return omit(result, keys)
  }
}

/**
 * 检索频道数据节点，结果返回到列表
 * @param data 
 * @param keywords 
 * @param list 
 */
export function filterChannelDataNode (data: Channel.DataNode[], keywords: string, list: Channel.DataNode[] = []) {
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
    filterChannelDataNode(data, keywords, list)
  }
  return
}

/**
 * 获取节点的目录结构
 * @param data 
 */
export function getNodeFolders<T extends CommonDataNode> (data: T[]) {
  let __data = cloneDeep(data.filter( r => !!r.children ))
  __data.forEach( (node: T, __v: number) => {
    __data[__v].children = getNodeFolders(node.children ?? [])
  })
  return __data
}

/**
 * 判断是否禁用
 * @param disabled 
 * @param env 
 */
export function isDisabled (disabled: boolean | FilterQuery<any> | string, env: Record<string, any> = {}) {
  if (!disabled) return false
  let query = disabled
  if (isString(disabled)) {
    query = jsYaml.safeLoad(parseTemplate(disabled, { ...env })) as FilterQuery<any>
    if (!isPlainObject(query)) return false
  } 
  if (isPlainObject(query)) {
    let filter = ruleJudgment(query as FilterQuery<any>)
    return filter({ ...env })
  }
  return disabled
}

/**
 * 判断是否过滤
 * @param conditions 
 * @param env 
 */
export function isFilter (conditions: FilterQuery<any> | string, env: Record<string, any> = {}) {
  if (!conditions) return true
  let query = conditions
  if (isString(conditions)) {
    query = jsYaml.safeLoad(parseTemplate(conditions, { ...env })) as FilterQuery<any>
    if (!isPlainObject(query)) return true
  } 
  let filter = ruleJudgment(query as FilterQuery<any>)
  return filter({ ...env })
}

/**
 * 获取过滤器
 * @param conditions 
 * @param env 
 */
export function getFilter (conditions: FilterQuery<any> | string, env: Record<string, any> = {}) {
  if (!conditions) return (data: any) => true
  let query: FilterQuery<any> = conditions as FilterQuery<any>
  if (isString(conditions)) {
    query = jsYaml.safeLoad(parseTemplate(conditions, { ...env })) as FilterQuery<any>
  }
  if (!isPlainObject(query)) return (data: any) => true
  return ruleJudgment(query)
}

/**
 * 获取过滤条件
 * @param conditions 
 * @param env 
 */
export function getConditions (conditions: FilterQuery<any> | string, env: Record<string, any> = {}) {
  if (!conditions) return null
  let query = conditions
  if (isString(conditions)) {
    query = jsYaml.safeLoad(parseTemplate(conditions, { ...env })) as FilterQuery<any>
  }
  if (!isPlainObject(query)) return null
  return query as FilterQuery<any>
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

export function parseContent (path: string, env: Record<string, any>) {
  let val = get(env, path, '')
  return val.split('\n').join('\n\n').replace(/\"/g, '\\"')
}

/**
 * 解析成时间格式
 */
export function parseDate (value: string | Date, nowValue?: Date | null): Date | null {
  if (isDate(value)) {
    return value
  }
  // 组合使用
  if (/(\_)/.test(value)) {
    let dates = value.split(/\_/)
    let now: Date | null = null
    for (let item of dates) {
      if (now && !/(day?(s|e)|week?(s|e))$/.test(item)) break
      now = parseDate(item, now)
    }
    return now
  }
  let dateValue = paeseDateString(value)
  // 当前时间
  if (value === 'now') {
    return new Date()
  }
  // 今天
  else if (value === 'today') {
    return parseDate('days')
  }
  // 昨天
  else if (value === 'yesterday') {
    return parseDate('-1 days')
  }
  // 天的当前时间
  else if (/(day)$/.test(value)) {
    let today = nowValue ?? new Date()
    return new Date(today.setDate(today.getDate() + dateValue))
  }
  // 天的开始时间
  else if (/(days)$/.test(value)) {
    let today = nowValue ?? new Date()
    return new Date(new Date(today.setDate(today.getDate() + dateValue)).setHours(0, 0, 0, 0))
  }
  // 天的结束时间
  else if (/(daye)$/.test(value)) {
    let today = nowValue ?? new Date()
    return new Date(new Date(today.setDate(today.getDate() + dateValue)).setHours(23, 59, 59, 999))
  }
  // 周的当前时间
  else if (/(week)$/.test(value)) {
    let now = nowValue ?? new Date()
    let nowDayOfWeek = now.getDay() - 1
    let date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - nowDayOfWeek + (dateValue * 7) + nowDayOfWeek)
      .setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
    return new Date(date)
  }
  // 周的开始时间
  else if (/(weeks)$/.test(value)) {
    let now = nowValue ?? new Date()
    let nowDayOfWeek = now.getDay() - 1
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - nowDayOfWeek + (dateValue * 7) + 0)
  }
  // 周的结束时间
  else if (/(weeke)$/.test(value)) {
    let now = nowValue ?? new Date()
    let nowDayOfWeek = now.getDay() - 1
    let date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - nowDayOfWeek + (dateValue * 7) + 6)
      .setHours(23, 59, 59, 999)
    return new Date(date)
  }
  // 月份的当前时间
  else if (/(month)$/.test(value)) {
    return new Date(new Date(new Date().setMonth(dateValue)))
  }
  // 月份的开始时间
  else if (/(months)$/.test(value)) {
    return new Date(new Date(new Date().setMonth(dateValue, 1)).setHours(0, 0, 0, 0))
  }
  // 月份的结束时间
  else if (/(monthe)$/.test(value)) {
    let offset = dateValue - new Date().getMonth() + 1
    return new Date(parseDate(`${offset} months`)!.getTime() - 1)
  }
  // 年份的当前时间
  else if (/(year)$/.test(value)) {
    return new Date(new Date().setFullYear(dateValue))
  }
  // 年份的开始时间
  else if (/(years)$/.test(value)) {
    return new Date(new Date(new Date().setFullYear(dateValue, 0, 1)).setHours(0, 0, 0, 0))
  }
  // 年份的结束时间
  else if (/(yeare)$/.test(value)) {
    return new Date(new Date(new Date().setFullYear(dateValue, 11, 31)).setHours(23, 59, 59, 999))
  }
  return null
}

export function paeseDateString (value: string) {
  let [ label, suffix ] = value.split(/\s+/)
  let [ type ] = value.match(/(year|month|day|week)/) ?? []
  let date = {
    day: 0,
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  }
  let val = get(date, type) ?? 0
  if (/(\d+){4}/.test(label)) {
    val = Number(label)
  }
  else if (!isNaN(Number(label))) {
    val += Number(label)
  }
  return val
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
    let parseData = merge(data, {})
    let str = isString(params) ? params : jsYaml.safeDump(params)
    let val = parseTemplate(str, parseData)
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
  return (value: string, row?: Record<string, any>, component?: Vue | Record<string, any>) => {
    let command = parseCommand(value)
    if (!command) return
    if (command.type === 'command') {
      let [ name, ...props ] = command.path.split('|')
      let runScript = get(commands ?? self, name)
      if (isFunction(runScript)) {
        runScript(...props)
      }
    }
    else if (command.type === 'action') {
      if (commands?.action) {
        commands?.action(command.path, row, component, self)
      }
    }
    else if (command.type === 'dialog') {
      if (commands?.dialog) {
        commands?.dialog(command.path, row, component, self)
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