import { Controller, Context, NextHandler, Get } from '@kenote/core'
import * as filter from '~/filters/api'
import { authenticate } from '~/plugins/passport'

@Controller('tools')
export default class ToolsController {
  
  /**
   * 查询IP信息
   */
  @Get('/ip', { filters: [ ...authenticate, filter.tools.ip ] })
  async ip (ctx: Context, next: NextHandler) {
    let { nextError, searchIP } = ctx.service
    try {
      let result = await searchIP(ctx.payload?.ips ?? [])
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}