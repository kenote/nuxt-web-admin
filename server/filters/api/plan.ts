import { Context, NextHandler } from '@kenote/core'
import { filterData, FilterData } from 'parse-string'
import { loadConfig } from '@kenote/config'
import { omit } from 'lodash'
import validator from 'validator'
import { FilterQuery } from 'mongoose'
import { PlanDocument } from '@/types/services/db'

export async function list (ctx: Context, next: NextHandler) {
  let { nextError, customize, toPageInfo, toSortOptions } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/plan', { mode: 'merge', assign: { now: new Date() } })
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
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function create (ctx: Context, next: NextHandler) {
  let { nextError, customize } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/plan', { mode: 'merge' })
  try {
    let document = filterData(filters.create, customize)(ctx.body)
    ctx.payload = document
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function edit (ctx: Context, next: NextHandler) {
  let { nextError, customize, ErrorCode, httpError, db } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/plan', { mode: 'merge' })
  let { _id } = ctx.params
  if (!validator.isMongoId(_id)) {
    throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
  }
  try {
    let plan = await db.plan.Dao.findOne({ _id })
    if (!plan) {
      throw httpError(ErrorCode.ERROR_VALID_IDMARK_NULL, ['操作', '方案'])
    }
    if (String(plan.user._id) != String(ctx.user._id)) {
      throw httpError(ErrorCode.ERROR_DATA_DOESNT_BELONG_YOU)
    }
    let document = filterData(filters.edit, customize)(ctx.body)
    ctx.payload = JSON.parse(JSON.stringify(document))
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function remove (ctx: Context, next: NextHandler) {
  let { nextError, httpError, ErrorCode, db, toArray } = ctx.service
  let { _id } = ctx.params
  let { ids } = ctx.body
  let conditions: FilterQuery<PlanDocument> = {
    user: ctx.user._id
  }
  try {
    if (_id) {
      if (!validator.isMongoId(_id)) {
        throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
      }
      let plan = await db.plan.Dao.findOne({ _id })
      if (!plan) {
        throw httpError(ErrorCode.ERROR_VALID_IDMARK_NULL, ['操作', '方案'])
      }
      if (String(plan.user._id) != String(ctx.user._id)) {
        throw httpError(ErrorCode.ERROR_DATA_DOESNT_BELONG_YOU)
      }
      conditions._id = _id
    }
    else {
      conditions._id = { $in: toArray(ids) }
    }
    ctx.payload = conditions
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}