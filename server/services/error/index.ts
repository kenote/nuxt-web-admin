import createError from 'http-errors'
import { format } from 'util'
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

export const ErrorCode = Code
export const ErrorMessage = Message