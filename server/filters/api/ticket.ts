import { Context, NextHandler } from '@kenote/core'
import { CreateGroupDocument } from '@/types/services/db'
import { get, isDate, isPlainObject, merge, omit } from 'lodash'
import { filterData, FilterData } from 'parse-string'
import { loadConfig } from '@kenote/config'
import validator from 'validator'

export async function create (ctx: Context, next: NextHandler) {
  let { nextError, db, httpError, ErrorCode, customize } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/ticket', { mode: 'merge', assign: { now: new Date() } })
  try {
    let document = filterData(filters.create, customize)(ctx.body)
    ctx.payload = document
    let setting = get(document, 'setting')
    if (setting?.group) {
      if (!validator.isMongoId(setting.group)) {
        throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
      }
      let group = await db.group.Dao.findOne({ _id: setting.group })
      if (!group) {
        throw httpError(ErrorCode.ERROR_VALID_GROUP_NOTEXIST)
      }
      ctx.filterUserLevel(group.level, 9998)
    }
    else {
      ctx.filterUserLevel(0, 9998)
    }
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function list (ctx: Context, next: NextHandler) {
  let { nextError, db, httpError, ErrorCode, toPageInfo, customize } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/ticket', { mode: 'merge', assign: { now: new Date() } })
  try {
    let document = filterData(filters.list, customize)(ctx.body)
    let { page, size } = document
    ctx.payload = {
      pageInfo: toPageInfo(page ?? 1, size ?? 15),
      query: omit(document, ['page', 'size'])
    }
    ctx.filterUserLevel(0, 9998)
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function edit (ctx: Context, next: NextHandler) {
  let { nextError, db, httpError, ErrorCode, toPageInfo, customize } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/ticket', { mode: 'merge', assign: { now: new Date() } })
  let { _id } = ctx.params
  if (!validator.isMongoId(_id)) {
    throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
  }
  try {
    let document = filterData(filters.edit, customize)(ctx.body)
    ctx.payload = document
    let setting = get(document, 'setting')
    if (setting?.group) {
      if (!validator.isMongoId(setting.group)) {
        throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
      }
      let group = await db.group.Dao.findOne({ _id: setting.group })
      if (!group) {
        throw httpError(ErrorCode.ERROR_VALID_GROUP_NOTEXIST)
      }
      ctx.filterUserLevel(group.level, 9998)
    }
    else {
      ctx.filterUserLevel(0, 9998)
    }
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function remove (ctx: Context, next: NextHandler) {
  let { nextError, db, httpError, ErrorCode, toPageInfo, customize } = ctx.service
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