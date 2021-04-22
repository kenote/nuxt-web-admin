import { Controller, Get, Post, Put, Delete, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import { CreateGroupDocument, GroupDocument, UserDocument } from '@/types/services/db'
import { isArray, compact } from 'lodash'
import * as filter from '~/filters/api'
import { FilterQuery } from 'mongoose'
import { QueryOptions } from '@kenote/mongoose'

@Controller('/group')
export default class GroupController {

  @Post('/create', { filters: [ filter.group.createGroup ] })
  async create (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError } = ctx.service
    try {
      return ctx.api(ctx.payload)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 获取用户组列表
   */
  @Post(':type(list|lite)', { filters: [ ...authenticate ] })
  async list (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { type } = ctx.params
    let { name } = ctx.body
    let user = ctx.user as UserDocument
    let conditions: FilterQuery<GroupDocument> = {}
    let options: QueryOptions = {}
    if (name) {
      options = {
        select: [ '_id', 'name', 'level' ],
        populate: { path: '' }
      }
      conditions.name = new RegExp(name, 'gi')
    }
    if (type === 'lite') {
      conditions.level = { $lt: user.group.level }
    }
    try {
      let list = await db.group.Dao.find(conditions, options)
      return ctx.api(list)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}