import { Controller, Get, Post, Put, Delete, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import { CreateGroupDocument, UserDocument, VerifyDocument } from '@/types/services/db'
import { isArray, compact, omit } from 'lodash'
import * as filter from '~/filters/api'
import { Account } from '@/types/account'



@Controller('/account')
export default class AccountController {

  /**
   * 账号登录
   */
  @Post('/login', { filters: [ filter.account.login ] })
  async login (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    try {
      let result = await db.user.login(ctx.payload)
      if (isArray(result)) {
        let verify = await db.verify.create({ type: 'login', application: JSON.stringify(result.map( r => r._id )) })
        let results: Account.uuidResult<UserDocument[]> = {
          uuid: verify.token,
          result
        }
        return ctx.api(results)
      }
      else {
        let user = await ctx.jwtLogin(result)
        return ctx.api(user)
      }
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 多账号选择登录
   */
  @Put('/login/select', { filters: [ filter.account.loginSelect ] })
  async loginSelect (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    try {
      let result = await db.user.loginSlect(ctx.payload)
      let user = await ctx.jwtLogin(result)
      return ctx.api(user)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 切换身份
   */
  @Get('/login/select', { filters: [ authenticate ] })
  async selectLogin (ctx: Context, next: NextHandler) {

  }

  /**
   * 校验访问令牌
   */
  @Get('/accesstoken', { filters: [ authenticate ] })
  async accessToken (ctx: Context) {
    return ctx.api(ctx.user)
  }
}