import { Context, NextHandler } from '@kenote/core'
import { CreateGroupDocument } from '@/types/services/db'
import { get, isDate, isPlainObject, merge, omit, isArray, map } from 'lodash'
import { filterData, FilterData } from 'parse-string'
import { loadConfig } from '@kenote/config'
import validator from 'validator'
import ruleJudgment from 'rule-judgment'
import { UserDocument } from '@/types/services/db'
import { FilterQuery } from 'mongoose'


export async function list (ctx: Context, next: NextHandler) {
  let { nextError, db, httpError, ErrorCode, toPageInfo, customize, toSortOptions } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/user', { mode: 'merge', assign: { now: new Date() } })
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
  let { nextError, db, httpError, ErrorCode, customize } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/user', { mode: 'merge', assign: { now: new Date() } })
  try {
    let document = filterData(filters.create, customize)(ctx.body)
    ctx.payload = document
    if (!document.group) {
      httpError(ErrorCode.ERROR_VALID_GROUP_REQUIRED)
    }
    let group = await db.group.Dao.findOne({ _id: document.group })
    if (!group) {
      throw httpError(ErrorCode.ERROR_VALID_GROUP_NOTEXIST)
    }
    ctx.filterUserLevel(group.level, 9998)
    if (group.level >= 9999) {
      throw httpError(ErrorCode.ERROR_BYLOND_LEVEL_OPERATE)
    }
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function edit (ctx: Context, next: NextHandler) {
  let { nextError, db, httpError, ErrorCode, toPageInfo, customize } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/user', { mode: 'merge', assign: { now: new Date() } })
  let { _id } = ctx.params
  if (!validator.isMongoId(_id)) {
    throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
  }
  try {
    let document = filterData(filters.edit, customize)(ctx.body)
    ctx.payload = document
    let user = await db.user.Dao.findOne({ _id })
    if (!user) {
      throw httpError(ErrorCode.ERROR_AUTH_OPERATE_USER_NULL)
    }
    ctx.filterUserLevel(user.group.level, 9998)
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function switchGroup (ctx: Context, next: NextHandler) {
  let { nextError, db, httpError, ErrorCode, toPageInfo, customize } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/user', { mode: 'merge', assign: { now: new Date() } })
  let { _id } = ctx.params
  if (!validator.isMongoId(_id)) {
    throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
  }
  try {
    let document = filterData(filters.switchGroup, customize)(ctx.body)
    ctx.payload = document
    let user = await db.user.Dao.findOne({ _id })
    if (!user) {
      throw httpError(ErrorCode.ERROR_AUTH_OPERATE_USER_NULL)
    }
    ctx.filterUserLevel(user.group.level, 9998)
    let group = await db.group.Dao.findOne({ _id: document?.group })
    if (!group) {
      throw httpError(ErrorCode.ERROR_AUTH_OPERATE_GROUP_NULL)
    }
    ctx.filterUserLevel(group.level, 9998)
    if (group.level >= 9999) {
      throw httpError(ErrorCode.ERROR_BYLOND_LEVEL_OPERATE)
    }
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function remove (ctx: Context, next: NextHandler) {
  let { nextError, db, httpError, ErrorCode, toArray } = ctx.service
  let { _id } = ctx.params
  let { ids } = ctx.body
  if (_id && !validator.isMongoId(_id)) {
    throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
  }
  try {
    let conditions: FilterQuery<UserDocument> = {
      _id: _id ?? { $in: toArray(ids) }
    }
    if (_id) {
      let user = await db.user.Dao.findOne({ _id })
      if (!user) {
        throw httpError(ErrorCode.ERROR_AUTH_OPERATE_USER_NULL)
      }
      ctx.filterUserLevel(user.group.level, 9998)
    }
    else {
      let users = await db.user.Dao.find(conditions)
      let filterUsers = users.filter( ruleJudgment({ 'group.level': { $lt: ctx.user?.group?.level } }) )
      conditions._id = { $in: map(filterUsers, '_id') }
      ctx.filterUserLevel(0, 9998)
    }
    ctx.payload = conditions
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}