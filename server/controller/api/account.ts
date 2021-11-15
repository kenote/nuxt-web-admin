import { Controller, Get, Post, Put, Context, NextHandler, Delete } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import { UserDocument, RegisterDocument, TicketDocument, NotificationDocument, AccoutNotificationDocument } from '@/types/services/db'
import { isArray, omit, pick, keys, get, set, cloneDeep } from 'lodash'
import * as filter from '~/filters/api'
import { Account } from '@/types/account'
import { FilterQuery } from 'mongoose'
import { CheckWarning } from '@/types/services/db/user'
import { toUser } from '~/middlewares/auth'
import { loadConfig } from '@kenote/config'
import { AccountConfigure } from '@/types/config'
import ruleJudgment from 'rule-judgment'
import { ListDataResult } from '@kenote/mongoose/types/dao'

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
        return ctx.api({ result: true, verify_id: verify._id })
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

  /**
   * 重置密码（找回密码用）
   */
  @Put('/resetpwd/:type(email|mobile)', { filters: [ filter.account.resetpwd ] })
  async resetpwd (ctx: Context, next: NextHandler) {
    let { nextError, db, httpError, ErrorCode } = ctx.service
    let { mailphoneTime } = loadConfig<AccountConfigure>('config/account', { mode: 'merge' })
    let { type } = ctx.params
    let { code, verify_id, password, name } = ctx.payload
    try {
      let user = await db.user.Dao.findOne({ [type]: name })
      if (!user) {
        throw httpError(ErrorCode.ERROR_FINDUSER_NOTEXIST)
      }
      let verify = await db.verify.check({ user: user._id, code }, mailphoneTime, verify_id)
      let result = await db.user.upInfo({ _id: user._id }, { password })
      console.log('password', password)
      await db.verify.Dao.remove({ _id: verify._id })
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 注册用户
   */
  @Post('/register', { filters: [ filter.account.register ] })
  async register (ctx: Context, next: NextHandler) {
    let { nextError, db, httpError, ErrorCode } = ctx.service
    let { invitation, emailVerify } = loadConfig<AccountConfigure>('config/account', { mode: 'merge' })
    let user: RegisterDocument = omit(ctx.payload, ['invitation']) as RegisterDocument
    try {
      let group = await db.group.basicGroup()
      let ticket: TicketDocument | null = null
      if (invitation || ctx.payload?.invitation) {
        ticket = await db.ticket.valid(ctx.payload?.invitation, { name: '邀请码', type: 'register' })
        let { setting } = ticket
        user.group = get(setting, 'group', group._id) 
      }
      else {
        user.group = group._id
      }
      let result = await db.user.register(user, ticket, emailVerify)
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 验证电子邮箱/手机号
   */
  @Put('/verify/:type(email|mobile)', { filters: [ filter.account.verifyEmailMobile ] })
  async verifyEmailMobile (ctx: Context, next: NextHandler) {
    let { nextError, db, httpError, ErrorCode } = ctx.service
    let { emailVerify } = loadConfig<AccountConfigure>('config/account', { mode: 'merge' })
    try {
      let result =  await db.user.verifyEmailMobile(ctx.payload, emailVerify)
      return ctx.api({ result: !!result })
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 获取账号消息通知
   */
  @Post('/notification/:mode(all|read|unread)', { filters: [ ...authenticate, filter.account.notification ] })
  @Post('/notification/:mode(all|read|unread)/:type', { filters: [ ...authenticate, filter.account.notification ] })
  async notification (ctx: Context, next: NextHandler) {
    let { nextError, db } = ctx.service
    let { mode, type } = ctx.params
    let { pageInfo, query, options } = ctx.payload
    let { limit, skip } = pageInfo
    let { findtype, findname, update_at } = query
    let conditions: FilterQuery<NotificationDocument> = {
      $or: [
        { receiver: [] },
        { receiver: { $eq: ctx.user._id } }
      ],
      release: true,
      removed: { $ne: ctx.user._id }
    }
    if (mode === 'read') {
      conditions.readed = { $eq: ctx.user._id }
    }
    else if (mode === 'unread') {
      conditions.readed = { $ne: ctx.user._id }
    }
    if (type) {
      conditions.type = type
    }
    // 按名称查询
    if (query.findname) {
      conditions[findtype] = new RegExp(findname)
    }
    // 按发布时间
    if (update_at?.length === 2) {
      let [ begin, end ] = update_at
      conditions.update_at = { $gte: begin, $lt: end }
    }
    try {
      let result = await db.notification.Dao.list(conditions, { ...options, limit, skip }) as ListDataResult<NotificationDocument>
      let listResult: ListDataResult<AccoutNotificationDocument> = { ...omit(result, ['data']), data: [] }
      if (result.data) {
        let data: AccoutNotificationDocument[] = []
        for (let item of result.data) {
          let info = formatAccoutNotification(item, ctx)!
          data.push(info)
        }
        listResult.data = data
      }
      return ctx.api(listResult)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 读取账号消息通知详情
   */
  @Get('/notification/:_id', { filters: [ ...authenticate ] })
  async notificationDetail (ctx: Context, next: NextHandler) {
    let { nextError, db, PubSub } = ctx.service
    let { _id } = ctx.params
    let conditions: FilterQuery<NotificationDocument> = {
      $or: [
        { receiver: [] },
        { receiver: { $eq: ctx.user._id } }
      ],
      release: true,
      removed: { $ne: ctx.user._id }
    }
    try {
      let result = await db.notification.Dao.findOne({ ...conditions, _id: { $eq: _id } })
      if (!result) {
        return ctx.api({ item: null, pervItem: null, nextItem: null })
      }
      let updateRead = await db.notification.Dao.updateOne({ ...conditions, _id: { $eq: _id } }, { $addToSet: { readed: ctx.user._id }})
      if (updateRead.nModified && updateRead.nModified > 0) {
        await PubSub.publish('notification', {
          headers: {
            path: 'notification'
          }
        })
      }
      let prevData = await db.notification.Dao.find({ ...conditions, update_at: { $gt: result.update_at } }, { sort: { update_at: 1 }, limit: 1 })
      let nextData = await db.notification.Dao.find({ ...conditions, update_at: { $lt: result.update_at } }, { sort: { update_at: -1 }, limit: 1 })
      let detailResult = {
        item: formatAccoutNotification(result, ctx, ['content']),
        pervItem: formatAccoutNotification(get(prevData, 0), ctx),
        nextItem: formatAccoutNotification(get(nextData, 0), ctx)
      }
      return ctx.api(detailResult)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 标记账号消息通知为已读
   */
  @Put('/notification/read', { filters: [ ...authenticate ] })
  @Put('/notification/read/:mode(all)', { filters: [ ...authenticate ] })
  async notificationSetRead (ctx: Context, next: NextHandler) {
    let { nextError, db, PubSub, toArray } = ctx.service
    let { mode } = ctx.params
    let { ids } = ctx.body
    let conditions: FilterQuery<NotificationDocument> = {
      $or: [
        { receiver: [] },
        { receiver: { $eq: ctx.user._id } }
      ],
      release: true,
      removed: { $ne: ctx.user._id }
    }
    if (mode != 'all') {
      conditions._id = { $in: toArray(ids) }
    }
    try {
      let updateRead = await db.notification.Dao.updateMany(conditions, { $addToSet: { readed: ctx.user._id } })
      if (updateRead.nModified && updateRead.nModified > 0) {
        await PubSub.publish('notification', {
          headers: {
            path: 'notification'
          }
        })
      }
      return ctx.api(updateRead)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 移除账号消息通知
   */
  @Delete('/notification', { filters: [ ...authenticate ] })
  @Delete('/notification/:mode(all)', { filters: [ ...authenticate ] })
  async notificationRemove (ctx: Context, next: NextHandler) {
    let { nextError, db, PubSub, toArray } = ctx.service
    let { mode } = ctx.params
    let { ids } = ctx.body
    let conditions: FilterQuery<NotificationDocument> = {
      $or: [
        { receiver: [] },
        { receiver: { $eq: ctx.user._id } }
      ],
      release: true,
      removed: { $ne: ctx.user._id }
    }
    if (mode != 'all') {
      conditions._id = { $in: toArray(ids) }
    }
    try {
      let updateRemoved = await db.notification.Dao.updateMany(conditions, { $addToSet: { removed: ctx.user._id } })
      if (updateRemoved.nModified && updateRemoved.nModified > 0) {
        await PubSub.publish('notification', {
          headers: {
            path: 'notification'
          }
        })
      }
      return ctx.api(updateRemoved)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}

/**
 * 格式化消息通知
 * @param data 
 * @param ctx 
 * @param detail 
 */
function formatAccoutNotification (data: NotificationDocument, ctx: Context, detail: string[] = []) {
  if (!data) return null
  let info = pick(data, ['_id', 'id', 'title', 'type', 'update_at', ...detail]) as AccoutNotificationDocument
  info.readed = data.readed.includes(ctx.user._id)
  return info
}