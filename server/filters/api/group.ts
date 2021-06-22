import { Context, NextHandler } from '@kenote/core'
import { CreateGroupDocument } from '@/types/services/db'
import { get } from 'lodash'
import { filterData, FilterData } from 'parse-string'
import { loadConfig } from '@kenote/config'
import validator from 'validator'

export async function create (ctx: Context, next: NextHandler) {
  let { nextError } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/group', { mode: 'merge' })
  try {
    let result = filterData(filters.create)(ctx.body)
    let document = getGroupDocument(result)
    ctx.payload = document
    ctx.filterUserLevel(document.level, 9998)
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function edit (ctx: Context, next: NextHandler) {
  let { nextError, httpError, ErrorCode, db } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/group', { mode: 'merge' })
  let { _id } = ctx.params
  if (!validator.isMongoId(_id)) {
    throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
  }
  try {
    let group = await db.group.Dao.findOne({ _id })
    if (!group) {
      throw httpError(ErrorCode.ERROR_AUTH_OPERATE_GROUP_NULL)
    }
    let result = filterData(filters.edit)(ctx.body)
    ctx.payload = getGroupDocument(result)
    ctx.filterUserLevel(group.level, 9998)
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function remove (ctx: Context, next: NextHandler) {
  let { nextError, httpError, ErrorCode, db } = ctx.service
  let { _id } = ctx.params
  let { move } = ctx.body
  if (!validator.isMongoId(_id)) {
    throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
  }
  try {
    let group = await db.group.Dao.findOne({ _id })
    if (!group) {
      throw httpError(ErrorCode.ERROR_AUTH_OPERATE_GROUP_NULL)
    }
    ctx.payload = {
      _id,
      options: { move }
    }
    ctx.filterUserLevel(group.level, 9998)
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
    let group = await db.group.Dao.findOne({ _id })
    if (!group) {
      throw httpError(ErrorCode.ERROR_AUTH_OPERATE_GROUP_NULL)
    }
    ctx.payload = {
      [authority]: get(ctx.body, authority) ?? []
    }
    ctx.filterUserLevel(group.level, 9998)
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

function getGroupDocument (body: Record<string, any>): CreateGroupDocument {
  let { name, description, level, download_type, upload_type } = body
  let user: CreateGroupDocument = {
    name,
    description,
    level,
    store: {
      download_type,
      upload_type
    }
  }
  return user
}