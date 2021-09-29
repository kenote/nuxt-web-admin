import { Context, NextHandler } from '@kenote/core'
import validator from 'validator'
import { isEmpty, isArray, compact } from 'lodash'

export async function ip (ctx: Context, next: NextHandler) {
  let { nextError } = ctx.service
  let { s } = ctx.query
  let ips: string[] = []
  if (isEmpty(s)) {
    ips.push(ctx.clientIP)
  }
  else {
    ips = isArray(s) ? s.map(String) : String(s).split(',')
  }
  try {
    ctx.payload = {
      ips: compact(ips.map(parseIP))
    }
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

function parseIP (value: string): string | null {
  let val = value.replace(/\s+/g, '')
  if (validator.isIP(val) || validator.isFQDN(val)) {
    return val
  }
  else if (/^\d+$/.test(val) && Number(val) >= 0 && Number(val) <= 0xffffffff) {
    return val
  }
  return null
}