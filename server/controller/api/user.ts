import { Controller, Get, Post, Put, Delete, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'

/**
 * 设置主路径
 */
@Controller('/user')
export default class UserController {

  /**
   * 绑定请求方式；支持 Get | Post | Put | Delete
   * 可以绑定多个路由
   */
  @Get('/')
  async getList (ctx: Context, next: NextHandler) {
    // ...
    // let { nextError } = ctx.service
    // try {
    //   let result = await ctx.db.group.create([])
    //   return ctx.api(result)
    // } catch (error) {
    //   nextError(error, ctx, next)
    // }
    ctx.api('list')
  }
}