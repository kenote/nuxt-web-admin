import { Context, NextHandler } from '@kenote/core'
import { filterData, FilterData } from 'parse-string'
import { loadConfig } from '@kenote/config'
import { Account } from '@/types/account'
import { EditUserDocument, UserDocument } from '@/types/services/db'
import { intersection, map, pick, get } from 'lodash'
import dayjs from 'dayjs'

export async function system (ctx: Context, next: NextHandler) {
  let { nextError, customize } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/oplog', { mode: 'merge' })
  try {
    let result = filterData(filters.system, customize)(ctx.body)
    ctx.payload = result
    ctx.filterUserLevel(0, 9998)
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}