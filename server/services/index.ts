import { HttpError } from 'http-errors'
import { Context, NextHandler } from '@kenote/core'

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