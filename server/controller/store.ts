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

  @Post('/upload', { filters: [ ...authenticate ] })
  @Post('/upload/:type', { filters: [ ...authenticate ] })
  async upload (ctx: Context, next: NextHandler) {
    // ...
    let { type } = ctx.params
    let { dir } = ctx.query
    let { ErrorCode, Store, httpError, nextError } = ctx.service
    try {
      let store = Store.store(type ?? 'default')(ctx.req)
      if (!store) {
        return await ctx.notfound()
      }
      let putStream = Store.putStreams[store.type ?? 'local']
      if (!putStream) {
        throw httpError(ErrorCode.ERROR_MISSING_CONFIG_PARAMETER)
      }
      let result = await store.upload(putStream, httpError, isArray(dir) ? dir[0] : dir ?? '')
      if (result.length === 0) {
        throw httpError(ErrorCode.ERROR_UPLOAD_NOT_FILE)
      }
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}