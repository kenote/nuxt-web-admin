import { Controller, Get, Post, Put, Delete, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import { CreateGroupDocument } from '@/types/services/db'
import { isArray, compact } from 'lodash'
import * as filter from '~/filters/api'

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
}