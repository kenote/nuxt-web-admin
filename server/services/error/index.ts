import createError, { HttpError } from 'http-errors'
import { format } from 'util'
import { Context, NextHandler } from '@kenote/core'
import Code from './code'
import Message from './message'

export function httpError (code: number, opts?: Array<string | number> | null) {
  let message = ''
  for (let [key, val] of Object.entries(Code)) {
    if (code === val) {
      message = Message[key]
      break
    }
  }
  message = format(message, ...[...opts ?? []])
  return createError(500, message, { code })
}

export function nextError (error: HttpError, ctx: Context, next: NextHandler) {
  if (error?.code >= 1000) {
    ctx.api(null, error)
  }
  else {
    return next(error)
  }
}

export const ErrorCode = Code
export const ErrorMessage = Message