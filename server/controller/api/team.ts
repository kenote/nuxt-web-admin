import { Controller, Get, Post, Put, Delete, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import { CreateGroupDocument, GroupDocument, UserDocument, TeamDocument } from '@/types/services/db'
import { isArray, compact, cloneDeep, set } from 'lodash'
import * as filter from '~/filters/api'
import { FilterQuery } from 'mongoose'
import { QueryOptions } from '@kenote/mongoose'

@Controller('/team')
export default class TeamController {

  /**
   * 团队列表
   */
  @Post('/', { filters: [ ...authenticate, filter.team.list ] })
  async list (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { pageInfo, query, options } = ctx.payload
    let { limit, skip } = pageInfo
    let conditions: FilterQuery<TeamDocument> = {}
    if (query.name) {
      conditions.name = {
        $regex: new RegExp(query.name, 'i')
      }
    }
    try {
      let result = await db.team.Dao.list(conditions, { ...options, limit, skip })
      let data = JSON.parse(JSON.stringify(result.data))
      // tslint:disable-next-line: prefer-for-of
      for (let i:number = 0; i < data.length; i++) {
        let counts = await db.user.Dao.counts({ teams: data[i]._id })
        data[i].peoples = counts
      }
      result.data = data
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 创建团队
   */
  @Post('/create', { filters: [ ...authenticate, filter.team.create ] })
  async create (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    try {
      let result = await db.team.Dao.create(ctx.payload)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 编辑团队信息
   */
  @Post('/edit/:_id', { filters: [ ...authenticate, filter.team.edit ]})
  async edit (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id } = ctx.params
    try {
      let result = await db.team.Dao.updateOne({ _id }, ctx.payload)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 编辑团队权限 
   */
  @Post('/:authority(platform|access)/:_id', { filters: [ ...authenticate, filter.team.authority ]})
  async authority (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id } = ctx.params
    try {
      let result = await db.team.Dao.updateOne({ _id }, ctx.payload)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 删除团队 
   */
  @Delete('/', { filters: [ ...authenticate, filter.team.remove ]})
  @Delete('/:_id', { filters: [ ...authenticate, filter.team.remove ]})
  async remove (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    try {
      let result = await db.team.Dao.remove(ctx.payload)
      await db.user.Dao.updateMany({ teams: ctx.payload?._id }, { $pull: { teams: ctx.payload?._id } }, { multi: true })
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 获取成员列表
   */
  @Get('/people/:_id', { filters: [ ...authenticate ] })
  async people (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id } = ctx.params
    try {
      let result = await db.team.peoples(_id)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 检索可选用户
   */
  @Put('/invite_suggestions/:_id', { filters: [ ...authenticate ] })
  async invite_suggestions (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id } = ctx.params
    let { name } = ctx.body
    if (!name) return ctx.api([])
    let conditions: FilterQuery<UserDocument> = {
      $or: [
        { username: new RegExp(name) },
        { email: new RegExp(name) },
        { mobile: new RegExp(name) },
        { nickname: new RegExp(name) },
      ],
      teams: { $ne: _id }
    }
    try {
      let result = await db.user.Dao.find(conditions, {
        select: [ 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'group', 'teams' ]
      })
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 添加成员 
   */
  @Put('/people/:_id', { filters: [ ...authenticate, filter.team.people ] })
  async addPeople (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id } = ctx.params
    let { user } = ctx.payload
    try {
      await db.user.Dao.updateOne({ _id: user }, { $addToSet: { teams: _id } })
      let result = await db.team.peoples(_id)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 移除成员 
   */
  @Delete('/people/:_id', { filters: [ ...authenticate, filter.team.people ] })
  async removePeople (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id } = ctx.params
    let { user } = ctx.payload
    try {
      await db.user.Dao.updateOne({ _id: user }, { $pull: { teams: _id } })
      let result = await db.team.peoples(_id)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 设置团长
   */
  @Put('/owner/:_id', { filters: [ ...authenticate, filter.team.people ]})
  async owner (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id } = ctx.params
    let { user } = ctx.payload
    try {
      await db.team.Dao.updateOne({ _id }, { owner: user })
      let result = await db.team.peoples(_id)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}