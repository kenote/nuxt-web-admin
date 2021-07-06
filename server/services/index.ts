import { HttpError } from 'http-errors'
import { Context, NextHandler } from '@kenote/core'
import { isSafeInteger, toSafeInteger, isPlainObject, isBoolean, isArray } from 'lodash'
import { isDateString } from 'rule-judgment'
import validator from 'validator'

export { ErrorCode, ErrorMessage, httpError } from './error'
export { default as logger } from './logger'
export { default as mailer } from './mailer'
export * as Bcrypt from './bcrypt'
export * as Store from './store'
export * as db from './db'
export * as sms from './sms'

export function nextError (error: HttpError, ctx: Context, next: NextHandler) {
  if (error?.code >= 1000) {
    ctx.api(null, error)
  }
  else {
    return next(error)
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
  isDateString,
  isPlainObject,
  isBoolean,
  toBoolean: value => validator.toBoolean(value)
}