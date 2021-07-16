import { Controller, Get, Post, Put, Delete, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import * as filter from '~/filters/api'
import { FilterQuery } from 'mongoose'
import { UserDocument } from '@/types/services/db'

/**
 * 设置主路径
 */
@Controller('/user')
export default class UserController {

  /**
   * 获取用户列表 
   */
  @Post('/', { filters: [ ...authenticate, filter.user.list ] })
  async list (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db, customize } = ctx.service
    let { pageInfo, query, options } = ctx.payload
    let { limit, skip } = pageInfo
    let conditions: FilterQuery<UserDocument> = {}
    let { findtype, findname, group, create_at } = query
    // 按名称查询
    if (query.findname) {
      conditions[findtype] = new RegExp(findname)
    }
    // 按用户组
    if (group?.length > 0) {
      conditions.group = { $in: group }
    }
    // 按创建时间
    if (create_at?.length === 2) {
      let [ begin, end ] = create_at
      conditions.create_at = { $gte: begin, $lt: end }
    }
    try {
      let result = await db.user.Dao.list(conditions, { ...options, limit, skip,
        select: [ 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'group', 'teams', 'binds', 'create_at', 'update_at' ]
      })
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 创建新用户
   */
  @Post('/create', { filters: [ ...authenticate, filter.user.create ] })
  async create (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    try {
      let result = await db.user.create(ctx.payload)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 编辑票据
   */
  @Post('/edit/:_id', { filters: [ ...authenticate, filter.user.edit ]})
  async edit (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id } = ctx.params
    try {
      let result = await db.user.upInfo({ _id }, ctx.payload)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 切换用户组
   */
  @Put('/switch-group/:_id', { filters: [ ...authenticate, filter.user.switchGroup ]})
  async switchGroup (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id } = ctx.params
    try {
      let result = await db.user.upInfo({ _id }, ctx.payload)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 删除用户
   */
  @Delete('/', { filters: [ ...authenticate, filter.user.remove ]})
  @Delete('/:_id', { filters: [ ...authenticate, filter.user.remove ]})
  async remove (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    try {
      let result = await db.user.remove(ctx.payload)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}