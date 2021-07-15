import { Context, NextHandler } from '@kenote/core'
import { CreateGroupDocument } from '@/types/services/db'
import { get, isDate, isPlainObject, merge, omit, isArray, map } from 'lodash'
import { filterData, FilterData } from 'parse-string'
import { loadConfig } from '@kenote/config'
import validator from 'validator'
import ruleJudgment from 'rule-judgment'
import { UserDocument } from '@/types/services/db'
import { FilterQuery } from 'mongoose'




export function list (ctx: Context, next: NextHandler) {
  let { nextError, db, httpError, ErrorCode, toPageInfo, customize, toSortOptions } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/team', { mode: 'merge', assign: { now: new Date() } })
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
  let { nextError } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/team', { mode: 'merge' })
  try {
    let document = filterData(filters.create)(ctx.body)
    ctx.payload = document
    ctx.filterUserLevel(0, 9998)
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function edit (ctx: Context, next: NextHandler) {
  let { nextError, httpError, ErrorCode, db } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/team', { mode: 'merge' })
  let { _id } = ctx.params
  if (!validator.isMongoId(_id)) {
    throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
  }
  try {
    let document = filterData(filters.edit)(ctx.body)
    ctx.payload = document
    ctx.filterUserLevel(0, 9998)
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function authority (ctx: Context, next: NextHandler) {
  let { nextError, httpError, ErrorCode, db } = ctx.service
  let { _id, authority } = ctx.params
  if (!validator.isMongoId(_id)) {
    throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
  }
  try {
    let team = await db.team.Dao.findOne({ _id })
    if (!team) {
      throw httpError(ErrorCode.ERROR_VALID_IDMARK_NULL, ['操作', '团队'])
    }
    ctx.payload = {
      [authority]: get(ctx.body, authority) ?? []
    }
    ctx.filterUserLevel(0, 9998)
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

export async function people (ctx: Context, next: NextHandler) {
  let { nextError, db, httpError, ErrorCode, toPageInfo, customize, toArray } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/team', { mode: 'merge' })
  let { _id } = ctx.params
  if (!validator.isMongoId(_id)) {
    throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
  }
  try {
    let document = filterData(filters.people)(ctx.body)
    let user = await db.user.Dao.findOne({ _id: document.user })
    if (!user) {
      throw httpError(ErrorCode.ERROR_AUTH_OPERATE_USER_NULL)
    }
    // if (user.teams.includes(_id) && ctx.method === 'put') {
    //     throw httpError(ErrorCode.ERROR_REPEAT_ADDTO)
    // }
    ctx.payload = document
    ctx.filterUserLevel(0, 9998)
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}