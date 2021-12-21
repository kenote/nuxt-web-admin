import { Controller, Context, NextHandler, Post, Delete, Get } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import * as filter from '~/filters/api'
import { FilterQuery } from 'mongoose'
import { PlanDocument, CreatePlanDocument, BookmarkDataNode } from '@/types/services/db'
import jsYaml from 'js-yaml'

@Controller('plan')
export default class PlanController {

  /**
   * 方案列表
   */
  @Post('/list', { filters: [ ...authenticate, filter.plan.list ] })
  async list (ctx: Context, next: NextHandler) {
    let { nextError, db } = ctx.service
    let { pageInfo, query, options } = ctx.payload
    let { limit, skip } = pageInfo
    let conditions: FilterQuery<PlanDocument> = {}
    let { name, type, create_at } = query
    // 按名称查询
    if (name) {
      conditions.name = new RegExp(name)
    }
    // 按类型
    if (type?.length > 0) {
      conditions.type = { $in: type }
    }
    // 按创建时间
    if (create_at?.length === 2) {
      let [ begin, end ] = create_at
      conditions.create_at = { $gte: begin, $lt: end }
    }
    try {
      let result = await db.plan.Dao.list(conditions, { ...options, limit, skip })
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
  
  /**
   * 创建一个方案 
   */
  @Post('/create', { filters: [ ...authenticate, filter.plan.create ] })
  async create (ctx: Context, next: NextHandler) {
    let { nextError, db } = ctx.service
    try {
      let payload = ctx.payload as CreatePlanDocument
      payload.user = ctx.user._id
      let result = await db.plan.Dao.create(payload)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 编辑一个方案
   */
  @Post('/edit/:_id', { filters: [ ...authenticate, filter.plan.edit ] })
  async edit (ctx: Context, next: NextHandler) {
    let { nextError, db } = ctx.service
    let { _id } = ctx.params
    try {
      let conditions: FilterQuery<PlanDocument> = {
        _id,
        user: ctx.user._id
      }
      let result = await db.plan.Dao.updateOne(conditions, { ...ctx.payload, update_at: new Date() })
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 删除方案
   */
  @Delete('/', { filters: [ ...authenticate, filter.plan.remove ]})
  @Delete('/:_id', { filters: [ ...authenticate, filter.plan.remove ] })
  async remove (ctx: Context, next: NextHandler) {
    let { nextError, db } = ctx.service
    try {
      let result = await db.plan.Dao.remove(ctx.payload)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 获取书签
   */
  @Get('/bookmark', { filters: [ ...authenticate ] })
  async bookmark (ctx: Context, next: NextHandler) {
    let { nextError, db } = ctx.service
    let conditions: FilterQuery<PlanDocument> = {
      user: ctx.user._id,
      type: 'bookmark'
    }
    try {
      let data: BookmarkDataNode[] = []
      let result = await db.plan.Dao.findOne(conditions)
      if (result) {
        let { content } = result
        data = jsYaml.load(content) ?? []
      }
      return ctx.api(data)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 保存书签
   */
  @Post('/bookmark', { filters: [ ...authenticate ] })
  async updateBookmark (ctx: Context, next: NextHandler) {
    let { nextError, db, PubSub } = ctx.service
    let { content } = ctx.body
    let conditions: FilterQuery<PlanDocument> = {
      user: ctx.user._id,
      type: 'bookmark'
    }
    try {
      let bookmark = await db.plan.Dao.findOne(conditions)
      if (bookmark) {
        await db.plan.Dao.updateOne({ _id: bookmark._id }, { content })
      }
      else {
        let document: CreatePlanDocument = {
          name: '',
          type: 'bookmark',
          user: ctx.user._id,
          content
        }
        await db.plan.Dao.create(document)
      }
      await PubSub.publish('bookmark', {
        headers: {
          path: 'bookmark'
        }
      })
      return ctx.api({ result: 'ok' })
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}