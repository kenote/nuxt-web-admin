import { Controller, Get, Post, Put, Delete, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import { CreateGroupDocument, UserDocument, VerifyDocument } from '@/types/services/db'
import { isArray, compact, omit, get, pick } from 'lodash'
import * as filter from '~/filters/api'
import { Account } from '@/types/account'
import { FilterQuery } from 'mongoose'
import { CheckWarning } from '@/types/services/db/user'


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
  @Get('/login/select', { filters: [ ...authenticate ] })
  async selectLogin (ctx: Context, next: NextHandler) {

  }

  /**
   * 校验访问令牌
   */
  @Get('/accesstoken', { filters: [ ...authenticate ] })
  async accessToken (ctx: Context) {
    return ctx.api(ctx.user)
  }

  /**
   * 账号登出
   */
  @Get('/logout', { filters: [ ...authenticate ] })
  async logout (ctx: Context, next: NextHandler) {
    let { nextError, db } = ctx.service
    try {
      await db.user.Dao.updateOne({ _id: ctx.user._id }, { jw_token: '' })
      ctx.logout()
      ctx.cookie('jwtoken', '')
      return ctx.api({ result: true })
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 修改基本信息
   */
  @Post('/baseinfo', { filters: [ ...authenticate ] })
  @Put('/baseinfo/:type(avatar)', { filters: [ ...authenticate ] })
  async baseinfo (ctx: Context, next: NextHandler) {
    let { nextError, db } = ctx.service
    let data = filter.account.getUserDocument(ctx.body, ctx.user)
    let props: string[] | null = null
    if (ctx.params.type === 'avatar') {
      props = ['avatar', 'update_at']
    }
    try {
      data.update_at = new Date()
      await db.user.Dao.updateOne({ _id: ctx.user._id }, props ? pick(data, props) : data)
      let info = await db.user.Dao.findOne({ _id: ctx.user._id })
      return ctx.api(props ? pick(info, props) : info)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 验证名称是否占用
   */
  @Put('/check/:type(username|email|mobile)')
  async check (ctx: Context, next: NextHandler) {
    let { nextError, db, ErrorCode, httpError } = ctx.service
    let { type } = ctx.params as { type: 'username' | 'email' | 'moble' }
    let { name, _id } = ctx.body
    let warnings: CheckWarning = {
      username: ErrorCode.ERROR_VALID_USERNAME_UNIQUE,
      email: ErrorCode.ERROR_VALID_EMAIL_UNIQUE,
      mobile: ErrorCode.ERROR_VALID_MOBILE_UNIQUE
    }
    let conditions: FilterQuery<UserDocument> = {
      [type]: { $eq: name }
    }
    if (_id) {
      conditions._id = { $ne: _id }
    }
    try {
      let result = await db.user.Dao.findOne(conditions)
      if (result) {
        throw httpError(warnings[type])
      }
      return ctx.api(!result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}