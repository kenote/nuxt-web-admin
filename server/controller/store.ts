import { Controller, Get, Post, Put, Delete, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import path from 'path'
import { isArray, compact } from 'lodash'
import { UserDocument } from '@/types/services/db'

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
      let fileDir = isArray(dir) ? dir[0] : dir ?? ''
      let { userDir } = Store.getOptions(type ?? 'default')
      if (userDir) {
        let user = ctx.user as UserDocument
        let dirArr = compact([ fileDir ])
        dirArr.push(user._id)
        fileDir = dirArr.join('/')
      }
      let putStream = Store.putStreams[store.type ?? 'local']
      if (!putStream) {
        throw httpError(ErrorCode.ERROR_MISSING_CONFIG_PARAMETER)
      }
      let result = await store.upload(putStream, httpError, fileDir)
      if (result.length === 0) {
        throw httpError(ErrorCode.ERROR_UPLOAD_NOT_FILE)
      }
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  @Get('/uploadfiles/:filename')
  @Get('/uploadfiles/:type/:filename')
  async download (ctx: Context, next: NextHandler) {
    let { type, filename } = ctx.params
    let { dir } = ctx.query
    let { Store, nextError } = ctx.service
    let { root_dir } = Store.getOptions(type) ?? {}
    try {
      if (!root_dir) {
        return ctx.notfound()
      }
      let rootDir = path.resolve(process.cwd(), root_dir!, String(dir ?? '').replace(/^\//, ''))
      let filePath = path.resolve(rootDir, filename)
      return ctx.downloadFile(filePath)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}