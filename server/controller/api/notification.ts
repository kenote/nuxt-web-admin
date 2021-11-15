import { Controller, Context, NextHandler, Get, Post, Put, Delete } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import * as filter from '~/filters/api'
import { FilterQuery } from 'mongoose'
import { NotificationDocument, UserDocument } from '@/types/services/db'
import { map } from 'lodash'

@Controller('notification')
export default class NotificationController {
  

  @Post('/list', { filters: [ ...authenticate, filter.notification.list ] })
  async list (ctx: Context, next: NextHandler) {
    let { nextError, db } = ctx.service
    let { pageInfo, query, options } = ctx.payload
    let { limit, skip } = pageInfo
    let conditions: FilterQuery<NotificationDocument> = {}
    let { release, title, type, create_at } = query
    // 按名称查询
    if (title) {
      conditions.title = new RegExp(title)
    }
    // 按类型
    if (type?.length > 0) {
      conditions.type = { $in: type }
    }
    // 按发布状态
    if (release) {
      conditions.release = release
    }
    // 按创建时间
    if (create_at?.length === 2) {
      let [ begin, end ] = create_at
      conditions.create_at = { $gte: begin, $lt: end }
    }
    try {
      let result = await db.notification.Dao.list(conditions, { ...options, limit, skip })
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 创建消息通知
   */
  @Post('/create', { filters: [ ...authenticate, filter.notification.create ] })
  async create (ctx: Context, next: NextHandler) {
    let { nextError, db } = ctx.service
    try {
      let result = await db.notification.Dao.create(ctx.payload)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 编辑消息通知
   */
  @Post('/edit/:_id', { filters: [ ...authenticate, filter.notification.edit ] })
  async edit (ctx: Context, next: NextHandler) {
    let { nextError, db } = ctx.service
    let { _id } = ctx.params
    try {
      let result = await db.notification.Dao.updateOne({ _id }, { ...ctx.payload, update_at: new Date() })
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 删除消息通知 
   */
  @Delete('/', { filters: [ ...authenticate, filter.notification.remove ]})
  @Delete('/:_id', { filters: [ ...authenticate, filter.notification.remove ]})
  async remove (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    try {
      let result = await db.notification.Dao.remove(ctx.payload)
      // 删除已读记录
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 发布消息通知
   */
  @Put('/release/:_id', { filters: [ ...authenticate, filter.notification.release ] })
  async release (ctx: Context, next: NextHandler) {
    let { nextError, db, PubSub } = ctx.service
    let { _id } = ctx.params
    try {
      let result = await db.notification.Dao.updateOne({ _id }, { release: true, update_at: new Date() })
      await PubSub.publish('notification', {
        headers: {
          path: 'notification'
        }
      })
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 获取接收用户列表
   */
  @Get('/receiver/:_id', { filters: [ ...authenticate ] })
  async people (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id } = ctx.params
    try {
      let result = await db.notification.receiver(_id)
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
    try {
      let notification = await db.notification.Dao.findOne({ _id })
      let conditions: FilterQuery<UserDocument> = {
        $or: [
          { username: new RegExp(name) },
          { email: new RegExp(name) },
          { mobile: new RegExp(name) },
          { nickname: new RegExp(name) },
        ],
        _id: { $nin: map(notification?.receiver ?? [], '_id') }
      }
      let result = await db.user.Dao.find(conditions, {
        select: [ 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'group', 'teams' ],
        limit: 100
      })
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
 
  /**
   * 添加接收用户 
   */
  @Put('/receiver/:_id', { filters: [ ...authenticate, filter.team.people ] })
  async addPeople (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id } = ctx.params
    let { user } = ctx.payload
    try {
      await db.notification.Dao.updateOne({ _id }, { $addToSet: { receiver: user } })
      let result = await db.notification.receiver(_id)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
 
  /**
   * 移除接收用户 
   */
  @Delete('/receiver/:_id', { filters: [ ...authenticate, filter.team.people ] })
  async removePeople (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id } = ctx.params
    let { user } = ctx.payload
    try {
      await db.notification.Dao.updateOne({ _id }, { $pull: { receiver: user } })
      let result = await db.notification.receiver(_id)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}