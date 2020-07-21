// Utils...
import { Maps } from 'kenote-config-helper'
import { MetaInfo } from 'vue-meta'
import { oc } from 'ts-optchain'
import { Command } from '@/types'
import { assign, random, isRegExp, isString, zipObject, remove } from 'lodash'
import * as nunjucks from 'nunjucks'
import * as rules from '@/utils/rules'
import * as yaml from 'js-yaml'

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

/**
 * 映射对象
 * @param data Maps<any>
 * @param props Maps<any>
 */
export function parseProps (data: Maps<any>, props: Maps<any>): Maps<any> {
  if (!props) return data
  let result = {}
  for (let key in props) {
    let _key: string = props[key]
    result[key] = /(\{)/.test(_key) ? nunjucks.renderString(_key, data) : data[_key]
  }
  return result
}

/**
 * 解析模版
 * @param tpl string
 * @param data Maps<any>
 */
export function parseTemplate (tpl: string, data: Maps<any>): string {
  return nunjucks.renderString(tpl, data)
}

/**
 * 随机密码
 */
export function randomPassword (): string {
  let password = Math.random().toString(36).substr(4).split('').map(toUpper).join('')
  let { pattern } = rules.password
  let rule = isRegExp(pattern) ? pattern : new RegExp(oc(pattern)('/^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/'))
  if (!rule.test(password)) {
    return randomPassword()
  }
  return password
}

function toUpper (value: string): string {
  let rand = random(0, 1)
  return rand === 1 && !/\d/.test(value) ? value.toLocaleUpperCase() : value
}

/**
 * 判断 Yaml 格式
 */
export function isYaml (str: string): boolean {
  try {
    return !!yaml.load(str)
  } catch (error) {
    return false
  }
}

/**
 * 解析默认值
 */
export function parseDefaultValue (value: any): any {
  if (Array.isArray(value)) {
    return value.map(parseDefaultValue)
  }
  let today = new Date(new Date().setHours(0, 0, 0, 0))
  if (isString(value) && /^([\-]{0,1})([0-9]{1,3})(days)$/.test(value)) {
    let parseValue = value.match(/^([\-]{0,1})([0-9]{1,3})(days)$/)
    let { val, operator } = zipObject(['', 'operator', 'val'], parseValue || [])
    return new Date(today.setDate(operator === '-' ? today.getDate() - Number(val) : today.getDate() + Number(val)))
  }
  switch (value) {
    case 'now':
      return new Date()
    case 'today':
      return today
    case 'yesterday':
      return new Date(today.setDate(today.getDate() - 1))
    default:
      return value
  }
}

/**
 * 格式化成数组
 * @param value string | string[]
 * @param type 'number' | 'string'
 * @param splitter RegExp
 */
export function formatArray (value?: string | string[], type: 'number' | 'string' = 'string', splitter: RegExp = /(\,|\|)/): Array<number | string> {
  if (!value) return []
  if (Array.isArray(value)) {
    return formatArray(value.join(','), type, splitter)
  }
  let _value = value.split(splitter)
  if (type === 'number') {
    return arrayToNumber(_value)
  }
  remove(_value, o => !o || splitter.test(o))
  return _value.sort()
}

function arrayToNumber (value: string[]): number[] {
  let _value: number[] = value.map(Number)
  remove(_value, o => !o)
  return _value.sort((a, b) => a - b)
}