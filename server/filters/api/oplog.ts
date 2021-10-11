import { Context, NextHandler } from '@kenote/core'
import { filterData, FilterData } from 'parse-string'
import { loadConfig } from '@kenote/config'
import { omit } from 'lodash'

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

export async function list (ctx: Context, next: NextHandler) {
  let { nextError, toPageInfo, customize, toSortOptions } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/oplog', { mode: 'merge', assign: { now: new Date() } })
  try {
    let document = filterData(filters.list, customize)(ctx.body)
    let { page, size, sort } = document
    ctx.payload = {
      pageInfo: toPageInfo(page ?? 1, size ?? 15),
      query: omit(document, ['page', 'size']),
      options: {
        sort: toSortOptions(sort) ?? { create_at: -1, id: -1 }
      }
    }
    ctx.filterUserLevel(0, 9998)
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}