import { Controller, Get, Post, Put, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import { UserDocument } from '@/types/services/db'
import { isArray, omit, pick, keys } from 'lodash'
import * as filter from '~/filters/api'
import { Account } from '@/types/account'
import { FilterQuery } from 'mongoose'
import { CheckWarning } from '@/types/services/db/user'
import { toUser } from '~/middlewares/auth'
import { loadConfig } from '@kenote/config'
import { AccountConfigure } from '@/types/config'
import ruleJudgment from 'rule-judgment'


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
      return ctx.api(toUser(user))
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
      await db.user.Dao.updateOne({ _id: ctx.user._id }, props ? pick(data, props) : omit(data, ['avatar']))
      let info = await db.user.Dao.findOne({ _id: ctx.user._id })
      return ctx.api(props ? pick(info, props) : toUser(info))
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

  /**
   *  发送验证邮件
   */
  @Get('/email_verify', { filters: [ ...authenticate ] })
  async sendVerifyEmail (ctx: Context, next: NextHandler) {
    let { nextError, db, ErrorCode, httpError } = ctx.service
    let { emailVerify } = loadConfig<AccountConfigure>('config/account', { mode: 'merge' })
    try {
      await db.user.sendEmailVerify(ctx.user, emailVerify)
      return ctx.api(null)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 发送验证码
   */
  @Put('/sendcode/:type(email|mobile)')
  async sendCode (ctx: Context, next: NextHandler) {
    let { nextError, db, sms, ErrorCode, httpError } = ctx.service
    let { type } = ctx.params
    let { name, verify_id } = ctx.body
    let { mailphoneStep, mailphoneTime } = loadConfig<AccountConfigure>('config/account', { mode: 'merge' })
    try {
      // 找回密码用
      if (verify_id === 'resetpwd') {
        let user = await db.user.Dao.findOne({ [type]: name })
        if (!user) {
          throw httpError(ErrorCode.ERROR_FINDUSER_NOTEXIST)
        }
        let verify = await db.verify.generate({ user: user._id }, mailphoneStep)
        if (type === 'email') {
          db.verify.sendMail('密码重置校验', user, verify.token, 'reset_pass.mjml', mailphoneTime)
        }
        else if (type === 'mobile') {
          await sms.sendSms(user.mobile!, 'password', { code: verify.token })
        }
        return ctx.api({ result: true })
      }
      // 用户登录用
      else if (verify_id === 'login' && type == 'mobile') {
        let verify = await db.verify.generate(null, mailphoneStep)
        await sms.sendSms(name, 'verifyid', { code: verify.token })
        return ctx.api({ result: true, verify_id: verify._id })
      }
      // 变更信息
      else {
        let user = await ctx.jwtUser()
        if (!user) {
          return await ctx.status(401).send('Unauthorized')
        }
        let verify = await db.verify.generate({ user: user._id }, mailphoneStep, { name, verify_id })
        if (type === 'email') {
          if (verify_id) {
            user.email = name
          }
          db.verify.sendMail(verify_id ? '邮箱校验' : '帐号身份校验', user, verify.token, 'send_code.mjml', mailphoneTime)
        }
        else if (type === 'mobile') {
          if (user) {
            await sms.sendSms(verify_id ? name : user?.mobile, verify_id ? 'setinfos' : 'verifyid', { code: verify.token })
          }
          else {
            await sms.sendSms(name, 'verifyid', { code: verify.token })
          }
        }
        return ctx.api({ result: true })
      }
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 校验验证码
   */
  @Post('/verifycode', { filters: [ ...authenticate ] })
  async verifyCode (ctx: Context, next: NextHandler) {
    let { nextError, db } = ctx.service
    let { code } = ctx.body
    let { mailphoneTime } = loadConfig<AccountConfigure>('config/account', { mode: 'merge' })
    try {
      let verify = await db.verify.check({ code, user: ctx.user?._id }, mailphoneTime)
      return ctx.api({ result: true, verify_id: verify._id })
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 设置用户安全数据
   */
  @Post('/upinfo/:type', { filters: [ ...authenticate, filter.account.upInfo ] })
  async upInfo (ctx: Context, next: NextHandler) {
    let { nextError, db, httpError, ErrorCode } = ctx.service
    let { mailphoneTime } = loadConfig<AccountConfigure>('config/account', { mode: 'merge' })
    let { verify_id, code } = ctx.payload
    let user = ctx.user as UserDocument
    try {
      let verify = await db.verify.check({ user: user._id }, mailphoneTime, verify_id)
      if (ruleJudgment({ $_in: [ 'email', 'mobile' ] })(keys(ctx.payload)) && verify.token !== code) {
        throw httpError(ErrorCode.ERROR_VERIFY_CODE_FAILED)
      }
      if (ctx.params?.type === 'remove') {
        // 注销账号
        if (user.group.level >= 9999) {
          throw httpError(ErrorCode.ERROR_NOT_REMOVE_CREATOR)
        }
        let result = await db.user.remove({ _id: user._id })
        await db.verify.Dao.remove({ _id: verify._id })
        return ctx.api(result)
      }
      else {
        let result = await db.user.upInfo({ _id: user._id }, omit(ctx.payload, ['verify_id', 'code']))
        await db.verify.Dao.remove({ _id: verify._id })
        return ctx.api(result)
      }
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
} 