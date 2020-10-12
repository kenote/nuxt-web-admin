// Utils...
import { Maps, KeyMap } from 'kenote-config-helper'
import { MetaInfo } from 'vue-meta'
import { oc } from 'ts-optchain'
import { Command } from '@/types'
import { assign, random, isRegExp, isString, zipObject, remove, Dictionary, isArray, compact, trim } from 'lodash'
import * as nunjucks from 'nunjucks'
import * as rules from '@/utils/rules'
import * as yaml from 'js-yaml'
import * as dayjs from 'dayjs'
import * as urlParse from 'url-parse'
import * as qs from 'query-string'
import { AxiosProxyConfig } from 'axios'
import { Channel } from '@/types/channel'

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
  let command = value.match(/^(command|router|https?)\:(\S+)$/)
  if (!command) return null
  let [ , type, path ] = command
  if (/^(https?)/.test(type)) {
    return { type: 'http', path: value }
  }
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

/**
 * 计算最大页数
 * @param counts 总数
 * @param limit 每页条数
 */
export function maxPageno (counts: number, limit: number): number {
  // tslint:disable-next-line: radix
  let pageno = parseInt(String((counts + limit - 1) / limit))
  return pageno
}

/**
 * 获取以月为分段两个时间的所有时间段
 * @param begin 开始时间
 * @param end 结束时间
 */
export function getRangeDateByMonth (begin: Date, end: Date): Date[][] {
  // 获取开始日期月底时间
  let begin_end = new Date(begin.getFullYear(), begin.getMonth() + 1, 0)
  // 获取结束日期月初时间
  let end_begin = new Date(end.getFullYear(), end.getMonth(), 1)
  let ranges: Date[][] = []
  if (begin_end.getTime() > end_begin.getTime()) {
    ranges.push([ begin, end ])
  }
  else {
    ranges.push([ begin, begin_end ])
    let diffMonth = dayjs(end_begin).diff(begin_end, 'month')
    for (let i = 1; i <= diffMonth; i++) {
      let diff_start = new Date(begin.getFullYear(), begin.getMonth() + i, 1)
      let diff_end = new Date(begin.getFullYear(), begin.getMonth() + i + 1, 0)
      ranges.push([ diff_start, diff_end ])
    }
    ranges.push([ end_begin, end ])
  }
  return ranges
}

/**
 * 获取以天为分段两个时间的所有时间段
 * @param begin 开始时间
 * @param end 结束时间
 */
export function getRangeDateByDay (begin: Date, end: Date): Date[][] {
  let ranges: Date[][] = []
  let diffDay = dayjs(end).diff(begin, 'day')
  for (let i = 0; i <= diffDay; i++) {
    let diff_start = dayjs(begin).add(i, 'day').toDate()
    let diff_end = dayjs(begin).add(i, 'day').toDate()
    ranges.push([ diff_start, diff_end ])
  }
  return ranges
}

/**
 * 将 Url 参数转换为 Collection
 * @param query 
 */
export function queryToCollection (url: string): Array<Dictionary<any>> {
  let collection: Array<Dictionary<any>> = []
  let { query } = urlParse(url)
  if (!query) return collection
  collection = String(query).replace(/^\?/, '').split('&').map(parseUrlQuery)
  return collection
}

/**
 * 将 Collection 转换为 Url 参数
 * @param collection 
 */
export function collectionToQuery (collection: Array<Dictionary<any>>): string {
  let query: string = ''
  for (let item of collection) {
    let { key, name } = item
    if (key || name) {
      query += `&${key}${name ? '=' + name : ''}`
    }
  }
  return query.replace(/^\&/, '?')
}

/**
 * 普通参数转换为 Collection
 * @param params 
 * @param array_column
 */
export function paramToCollection (params: Dictionary<any>, array_column: boolean = false): Array<Dictionary<any>> {
  let collection: Array<Dictionary<any>> = []
  for (let key in params) {
    let name = params[key]
    if (isArray(name) && array_column) {
      for (let item of name) {
        collection.push({ key, name: item })
      }
    }
    else {
      collection.push({ key, name })
    }
  }
  return collection
}

/**
 * 解析 Url 参数
 * @param value 
 */
function parseUrlQuery (value: string): Dictionary<any> {
  return zipObject(['key', 'name'], value.split('='))
}

/**
 * 解析URL到代理配置
 * @param url 
 */
export function urlToProxyConfig (url?: string): AxiosProxyConfig | false {
  if (!url) return false
  let { hostname: host, port, protocol, username, password } = urlParse(url)
  if (!host) return false
  let proxy: AxiosProxyConfig = {
    host,
    port: Number(port || '8080'),
    protocol: oc(protocol)('http').replace(/(\:)$/, '')
  }
  if (username && password) {
    proxy.auth = { username, password }
  }
  return proxy
}

/**
 * 解析代理配置到URL
 * @param proxy 
 */
export function proxyConfigToUrl (proxy?: AxiosProxyConfig | false): string | undefined {
  if (!proxy) return undefined
  let { host, port, protocol, auth } = proxy
  if (!host) return undefined
  let url = urlParse('http://')
  url.set('host', host)
  url.set('port', port)
  protocol && url.set('protocol', protocol)
  if (auth) {
    url.set('username', auth.username)
    url.set('password', auth.password)
  }
  return url.toString()
}

/**
 * 获取URL地址全路径
 * @param url 
 * @param site_url 
 */
export function getUrlAddress (url: string, site_url: string = ''): string {
  if (!site_url) {
    site_url = oc(location).origin('')
  }
  if (/^(\/{2})/.test(url)) {
    url = `http:${url}`
  }
  else if (/^(\/{1})/.test(url)) {
    url = `${site_url}${url}`
  }
  return encodeURI(trim(url))
}

/**
 * 将 API 转为 Shell
 * @param fetch 
 * @param site_url 
 */
export function fetchToShell (fetch: Channel.api, site_url: string = '', head: boolean = false): string {
  let { method, url, params } = fetch
  let headers = paramToCollection(oc(fetch).options.header({}), true)
  let proxy = oc(fetch).options.proxy(false)
  let shell = `curl`
  let methodType = method === 'get' ? '' : '-X ' + oc(method)('post').toUpperCase()
  let urlAddress = `"${getUrlAddress(url, site_url)}"`
  let header = headers.map( o => `-H "${o.key}:${o.name}"` )
  let httpProxy = proxyConfigToUrl(proxy)
  if (httpProxy) {
    httpProxy = '-x ' + httpProxy
  }
  let data = qs.stringify(params || {})
  let contentType = headers.find( o => o.key === 'Content-Type')
  if (contentType?.name === 'application/json') {
    data = JSON.stringify(params)
  }
  let postData = method === 'get' ? '' : `-d "${data}"`
  if (head) {
    postData = '-I'
  }
  let arr = compact([ shell, postData, methodType, urlAddress, ...header, httpProxy ])
  return arr.join(' ')
}
