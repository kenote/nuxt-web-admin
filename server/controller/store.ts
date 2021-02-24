import { Controller, Get, Post, Put, Delete, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
// import { putStream } from '@kenote/upload'
import path from 'path'
import { isArray } from 'lodash'

/**
 * 设置主路径
 */
@Controller('/')
export default class StoreController {

  /**
   * 绑定请求方式；支持 Get | Post | Put | Delete
   * 可以绑定多个路由
   */
  @Post('/upload')
  @Post('/upload/:type')
  async upload (ctx: Context, next: NextHandler) {
    // ...
    let { type } = ctx.params
    let { dir } = ctx.query
    try {
      let store = ctx.service.Store.store(type ?? 'default')(ctx.req)
      if (!store) {
        return await ctx.notfound()
      }
      let putStream = ctx.service.Store.putStreams[store.type ?? 'local']
      if (!putStream) {
        throw ctx.service.httpError(ctx.service.ErrorCode.ERROR_MISSING_CONFIG_PARAMETER)
      }
      let result = await store.upload(putStream, ctx.service.httpError, isArray(dir) ? dir[0] : dir ?? '')
      if (result.length === 0) {
        throw ctx.service.httpError(ctx.service.ErrorCode.ERROR_UPLOAD_NOT_FILE)
      }
      return ctx.api(result)
    } catch (error) {
      ctx.service.nextError(error, ctx, next)
    }
  }
}