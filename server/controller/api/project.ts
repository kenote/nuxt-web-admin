import { Controller, Get, Post, Put, Delete, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import * as filter from '~/filters/api'
import { Project } from '@/types/services/project'
import { get, merge } from 'lodash'
import { parseBody } from 'parse-string'
import { HttpRequest } from '@/types/services/http'

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
    let { nextError, httpError, ErrorCode, protobuf, http, searchIP, db } = ctx.service
    let { options, payload, tcpSocket } = ctx.payload as Project.NextPayload
    try {
      let result
      // 处理 Http 代理
      if (options.proxy) {
        let requestOptions: HttpRequest = options.proxy
        if (requestOptions.method.toUpperCase() === 'GET') {
          requestOptions.params = merge(requestOptions.params, payload)
        }
        else {
          requestOptions.body = merge(requestOptions.body, payload)
        }
        let ret = await http.shellAsCurl(requestOptions)
        let [ , code ] = ret.status?.split(/\s+/)
        if (code != '200') {
          throw httpError(ErrorCode.ERROR_CUSTOMIZE_DATA, [ 'Proxy:', ret.status?.replace('404 OK', '404 Not Found')! ])
        }
        result = ret.body
      }
      // 处理 TcpSocket
      else if (options.message) {
        let { msgtype, requestType, serverTag } = options.message
        result = await protobuf.request(msgtype, payload!, requestType)(merge(tcpSocket, { TcpSocket: options.tcpSocket }), serverTag)
      }
      // 处理内部服务代理
      else if (options.service) {
        let proxys = {
          searchIP: async (payload: { ips: [] }) => searchIP(payload.ips)
        }
        let func = get(proxys, options.service.name)
        if (!func) {
          throw httpError(ErrorCode.ERROR_CUSTOMIZE_DATA, [`[${options.service.name}] 内部服务不存在`])
        }
        result = await func(payload, options.service.options)
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