import { Controller, Get, Post, Put, Delete, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import { CreateGroupDocument, GroupDocument, UserDocument } from '@/types/services/db'
import { isArray, compact } from 'lodash'
import * as filter from '~/filters/api'
import { FilterQuery } from 'mongoose'
import { QueryOptions } from '@kenote/mongoose'

@Controller('/group')
export default class GroupController {

  /**
   * 创建用户组
   */
  @Post('/create', { filters: [ ...authenticate, filter.group.create ] })
  async create (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    try {
      let result = await db.group.create(ctx.payload)
      return ctx.api(result)
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

  /**
   * 编辑用户组
   */
  @Post('/edit/:_id', { filters: [ ...authenticate, filter.group.edit ]})
  async edit (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id } = ctx.params
    try {
      let result = await db.group.update({ _id }, ctx.payload)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 删除用户组 
   */
  @Delete('/:_id', { filters: [ ...authenticate, filter.group.remove ]})
  async remove (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id, options } = ctx.payload
    try {
      let result = await db.group.remove({ _id }, options)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 编辑用户组权限 
   */
  @Post('/:authority(platform|access)/:_id', { filters: [ ...authenticate, filter.group.authority ]})
  async authority (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id } = ctx.params
    try {
      let result = await db.group.update({ _id }, ctx.payload)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}