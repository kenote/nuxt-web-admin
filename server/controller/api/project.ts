import { Controller, Get, Post, Put, Delete, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import * as filter from '~/filters/api'
import { Project } from '@/types/services/project'
import { get, merge } from 'lodash'
import { parseBody } from 'parse-string'

@Controller('project')
export default class ProjectController {

  /**
   * 自助式API
   */
  @Get('/:channel/:tag', { filters: [ filter.project.request ] })
  @Post('/:channel/:tag', { filters: [ filter.project.request ] })
  @Put('/:channel/:tag', { filters: [ filter.project.request ] })
  @Delete('/:channel/:tag', { filters: [ filter.project.request ] })
  async request (ctx: Context, next: NextHandler) {
    let { nextError, db, protobuf, http } = ctx.service
    let { options, payload, tcpSocket } = ctx.payload as Project.NextPayload
    try {
      let result
      // 处理 Http 代理
      if (options.proxy) {
        let { method, url } = options.proxy
        result = await http.httpClient(options.proxy.options)[method ?? 'GET'](url, payload)
      }
      // 处理 TcpSocket
      else if (options.message) {
        let { msgtype, requestType, serverTag } = options.message
        result = await protobuf.request(msgtype, payload!, requestType)(merge(tcpSocket, { TcpSocket: options.tcpSocket }), serverTag)
      }
      // 解析数据
      if (options.parse) {
        result = parseBody(options.parse)(get(result, options.parseField ?? ''))
      }
      if (options.native) {
        ctx.service.apilog({ data: result }, ctx)
        return ctx.send(result)
      }
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}