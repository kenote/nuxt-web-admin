import { Controller, Context, NextHandler, Get } from '@kenote/core'
import dns from 'dns'
import validator from 'validator'
import { IPInfo, IPInfoResponse } from '@/types/services/qqwry'
import * as filter from '~/filters/api'
import { authenticate } from '~/plugins/passport'

@Controller('tools')
export default class ToolsController {
  
  /**
   * 查询IP信息
   */
  @Get('/ip', { filters: [ ...authenticate, filter.tools.ip ] })
  async ip (ctx: Context, next: NextHandler) {
    let { nextError, qqwry } = ctx.service
    let { ips } = ctx.payload
    try {
      let info: IPInfo[] = []
      for (let ip of ips) {
        if (validator.isFQDN(ip)) {
          let dips = await dns.promises.resolve4(ip)
          for (let item of dips) {
            info.push(qqwry.searchIP(item))
          }
        }
        else {
          info.push(qqwry.searchIP(ip))
        }
      }
      let ipInfoResponse: IPInfoResponse = {
        name: qqwry.name,
        version: qqwry.version,
        info
      }
      return ctx.api(ipInfoResponse)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}