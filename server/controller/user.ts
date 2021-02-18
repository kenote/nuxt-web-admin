import { Controller, Get, Post, Put, Delete, Context, NextHandler } from '@kenote/core'

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
  getList (ctx: Context, next: NextHandler) {
    // ...
    ctx.api('list')
  }
}