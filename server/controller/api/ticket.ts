import { Controller, Get, Post, Put, Delete, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import * as filter from '~/filters/api'
import { FilterQuery } from 'mongoose'
import { TicketDocument } from '@/types/services/db'

@Controller('/ticket')
export default class TicketController {

  /**
   * 获取票据列表 
   */
  @Post('/', { filters: [ ...authenticate, filter.ticket.list ] })
  async list (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db, customize } = ctx.service
    let { pageInfo, query, options } = ctx.payload
    let { limit, skip } = pageInfo
    let conditions: FilterQuery<TicketDocument> = {}
    if (query.name) {
      conditions.name = {
        $regex: new RegExp(query.name, 'i')
      }
    }
    if (query.type) {
      conditions.type = query.type
    }
    if (customize.isBoolean(query.used)) {
      conditions.used = query.used
    }
    if (customize.isBoolean(query.expired)) {
      conditions.last_at = query.expired ? {
        $lte: new Date()
      }: {
        $gt: new Date()
      }
    }
    try {
      let result = await db.ticket.Dao.list(conditions, { ...options, limit, skip })
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 创建票据
   */
  @Post('/create', { filters: [ ...authenticate, filter.ticket.create ] })
  async create (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    try {
      let result = await db.ticket.create(ctx.payload)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 编辑票据
   */
  @Post('/edit/:_id', { filters: [ ...authenticate, filter.ticket.edit ]})
  async edit (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { _id } = ctx.params
    try {
      let result = await db.ticket.Dao.updateOne({ _id }, ctx.payload)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 删除票据 
   */
  @Delete('/', { filters: [ ...authenticate, filter.ticket.remove ]})
  @Delete('/:_id', { filters: [ ...authenticate, filter.ticket.remove ]})
  async remove (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    try {
      let result = await db.ticket.Dao.remove(ctx.payload)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}