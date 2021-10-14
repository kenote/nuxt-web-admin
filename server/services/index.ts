import { HttpError } from 'http-errors'
import { Context, NextHandler } from '@kenote/core'
import { toSafeInteger, isPlainObject, isBoolean, isArray, flattenDeep, cloneDeep, get, omit } from 'lodash'
import validator from 'validator'
import { Oplog } from '@/types/services/db'
import { APIConfigure } from '@/types/config'
import { loadConfig } from '@kenote/config'
import ruleJudgment, { isDateString } from 'rule-judgment'
import glob from 'glob'
import async from 'async'
import mime from 'mime-types'
import fs from 'fs'
import { toValue } from 'parse-string'
import inspect from 'object-inspect'
import vm from 'vm'

export { ErrorCode, ErrorMessage, httpError } from './error'
export { default as logger, rootDir as logDir } from './logger'
export { default as mailer } from './mailer'
export * as Bcrypt from './bcrypt'
export * as Store from './store'
export * as db from './db'
export * as sms from './sms'
export { toValue } from 'parse-string'
export { isDateString } from 'rule-judgment'
export * as protobuf from './protobuf'
export * as http from './http'
export { default as qqwry, QQwry, int2ip, ip2int, searchIP } from './qqwry'
export * as xlsx from './xlsx'
export * as archiver from './archiver'
export * as alicloud from './alicloud'

export { inspect }

export function nextError (error: HttpError, ctx: Context, next: NextHandler) {
  if (error?.code >= 1000) {
    ctx.api(null, error)
  }
  else {
    return next(error)
  }
}

export function apilog (response: Oplog.Response, ctx: Context) {
  let { logger, db } = ctx.service
  let APINodes = flattenDeep(loadConfig<APIConfigure.NodeItem[][]>('config/apilog', { type: 'array' }))
  let filter = ruleJudgment<APIConfigure.NodeItem>({ $where: item => item.method.includes(ctx.method) && item.regexp.test(ctx.originalUrl) })
  let APINode = APINodes.find(filter)
  let Iresponse = cloneDeep(response)
  if (APINode) {
    setTimeout(async () => {
      await db.oplog.create(Iresponse, APINode!, ctx)
    }, 300)
  }
  let info = getAPIInfo(response, ctx)
  logger.info(info)
}

export function getAPIInfo (response: Oplog.Response, ctx: Context) {
  let request: Oplog.Request = {
    originalUrl: ctx.originalUrl,
    method: ctx.method,
    headers: ctx.headers,
    body: ctx.body
  }
  let info: Oplog.API = {
    address: ctx.clientIP,
    request,
    response
  }
  return info
}

export function pickFiles (patterns: string[], options: glob.IOptions): Promise<string[]> {
  return new Promise((resolve, reject) => {
    async.map(
      patterns,
      (pattern, next) => {
        glob(pattern, options, next)
      },
      (err, results: string[][]) => {
        if (err) {
          reject(err)
        }
        else {
          let files = results?.reduce( (files: string[], item: string[]) => files.concat(item) )
          resolve(files)
        }
      }
    )
  })
}

/**
 * 获取日期的开始时间和结束时间
 * @param day 
 */
export function getDateTimes (day: Date, hour?: number) {
  let start = cloneDeep(day)
  let end = cloneDeep(day)
  start.setHours(hour ?? 0, 0, 0, 0o0)
  end.setHours(hour ?? 23, 59, 59, 999)
  return { start, end }
}

/**
 * 将带有日期信息文件路径解析成指定对象格式
 * @param dir 
 */
export function parseToLogfile (dir: string, pattern?: RegExp, index?: number[]) {
  return (file: string) => {
    let stats = fs.statSync(file)
    let [ , , filename ] = file.match(new RegExp(`^(${dir}\/)(\\S+)$`))
    let [ day, hour ] = index ?? []
    let date: Partial<Record<'start' | 'end', Date>> = {}
    if (pattern && day) {
      let dateString = filename.match(pattern)
      date = getDateTimes(toValue('date')(get(dateString, day)), Number(get(dateString, hour) ?? 0))
    }
    return {
      filename,
      mime: mime.lookup(file) || 'application/octet-stream',
      size: stats.size,
      ...date
    }
  }
}

export function toPageInfo (pageno: number, size: number = 10) {
  size = toSafeInteger(size)
  let limit = isNaN(size) || size < 1 ? 10 : size
  let parseVal = toSafeInteger(pageno ?? 1)
  let val = isNaN(parseVal) ? 1 : parseVal
  let page = isNaN(val) || val < 1 ? 1 : parseVal
  let skip = (page -1) * limit
  return { page, skip, limit }
}

export function toArray (value: string | string[], splitter: string | RegExp = /\,/) {
  return isArray(value) ? value : value.split(splitter)
}

export function toSortOptions (value?: string[]) {
  let [ prop, order ] = value ?? []
  if (!prop) return undefined
  let options = { [prop]: /^(desc)/.test(order ?? 'asc') ? -1 : 0 }
  return options
}

export const customize = {
  isDateString: value => {
    let val = /^(\d)+$/.test(value) ? Number(value) : value
    return isDateString(val)
  },
  isPlainObject,
  isBoolean,
  toBoolean: value => validator.toBoolean(value),
  isEmail: value => value ? validator.isEmail(value) : true,
  isMobile: value => value ? validator.isMobilePhone(value, 'zh-CN') : true,
  isMongoId: value => value ? validator.isMongoId(value) : true,
  setTime (value: Date, hours: number = 0, min: number = 0, sec: number = 0, ms: number = 0) {
    return new Date(new Date(value).setHours(hours, min, sec, ms))
  },
  formatDate: value => {
    return value
  }
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
      result[key] = vm.runInNewContext(`let payload = ${inspect(data)}; ${val}`)
      if (key !== val) {
        keys.push(val)
      }
    }
    return omit(result, keys)
  }
}