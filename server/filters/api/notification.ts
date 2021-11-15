import { Context, NextHandler } from '@kenote/core'
import { filterData, FilterData } from 'parse-string'
import { loadConfig } from '@kenote/config'
import { omit } from 'lodash'
import validator from 'validator'

export async function list (ctx: Context, next: NextHandler) {
  let { nextError, customize, toPageInfo, toSortOptions } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/notification', { mode: 'merge', assign: { now: new Date() } })
  try {
    let document = filterData(filters.list, customize)(ctx.body)
    let { page, size, sort } = document
    ctx.payload = {
      pageInfo: toPageInfo(page ?? 1, size ?? 15),
      query: omit(document, ['page', 'size']),
      options: {
        sort: toSortOptions(sort)
      }
    }
    ctx.filterUserLevel(0, 9998)
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function create (ctx: Context, next: NextHandler) {
  let { nextError } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/notification', { mode: 'merge' })
  try {
    ctx.filterUserLevel(0, 9998)
    let result = filterData(filters.create)(ctx.body)
    ctx.payload = result
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function edit (ctx: Context, next: NextHandler) {
  let { nextError, httpError, ErrorCode, customize } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/notification', { mode: 'merge' })
  let { _id } = ctx.params
  if (!validator.isMongoId(_id)) {
    throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
  }
  try {
    ctx.filterUserLevel(0, 9998)
    let document = filterData(filters.edit, customize)(ctx.body)
    ctx.payload = document
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function remove (ctx: Context, next: NextHandler) {
  let { nextError, db, httpError, ErrorCode, toPageInfo, customize, toArray } = ctx.service
  let { _id } = ctx.params
  let { ids } = ctx.body
  if (_id && !validator.isMongoId(_id)) {
    throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
  }
  try {
    ctx.payload = {
      _id: _id ?? { $in: toArray(ids) }
    }
    ctx.filterUserLevel(0, 9998)
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function release (ctx: Context, next: NextHandler) {
  let { nextError, httpError, ErrorCode } = ctx.service
  let { _id } = ctx.params
  if (!validator.isMongoId(_id)) {
    throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
  }
  try {
    ctx.filterUserLevel(0, 9998)
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}