import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { language } from '~/config'
import { oc } from 'ts-optchain'
import { loadError } from '~/utils/error'
import { authenticate, setToken } from '~/middleware/auth'
import passportFilter from '~/filters/api_v1/passport'
import * as PassportAPI from '@/types/apis/passport'
import userProxy from '~/proxys/user'
import verifyProxy from '~/proxys/verify'
import ticketProxy from '~/proxys/ticket'
import { ResponseUserDocument } from '@/types/proxys/user'
import { ResponseVerifyDocument } from '@/types/proxys/verify'
import __ErrorCode from '~/utils/error/code'

@Path('/passport')
class PassportController extends Controller {

  /**
   * 校验访问令牌
   */
  @Router({ method: 'get', path: '/accesstoken' })
  @Filter( authenticate )
  public async accessToken (req: Request, res: IResponse, next: NextFunction): Promise<Response> {
    return res.api(req.user)
  }

  /**
   * 用户登录
   */
  @Router({ method: 'post', path: '/login' })
  @Filter( passportFilter.login )
  public async login (document: PassportAPI.login, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    try {
      let user = await UserProxy.login(document)
      let token = setToken({ _id: user._id })
      res.cookie('token', token)
      await UserProxy.Dao.updateOne({ _id: user._id }, { jw_token: token })
      return res.api(user)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 用户登出
   */
  @Router({ method: 'get', path: '/logout' })
  @Filter( authenticate )
  public async logout (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    let user = req.user as ResponseUserDocument
    try {
      await UserProxy.Dao.updateOne({ _id: user._id }, { jw_token: '' })
      req.logout()
      res.cookie('token', null)
      return res.api({ result: true })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 发送验证码 
   */
  @Router({ method: 'put', path: '/resetpwd/code/:type(email|mobile)' })
  @Filter( passportFilter.resetpwdCode )
  public async resetpwdCode (resetpwd: PassportAPI.restPwd, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type, document, setting } = resetpwd
    let { name } = document
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    let VerifyProxy = verifyProxy(errorState)
    try {
      let user = await UserProxy.Dao.findOne({ [type]: name }) as ResponseUserDocument
      if (!user) {
        return res.api(null, __ErrorCode.ERROR_FINDUSER_NOTEXIST)
      }
      let verify = await VerifyProxy.generate({ user: user._id }, setting.mailphone_step)
      if (type === 'email') {
        VerifyProxy.sendMail('密码重置校验', user, verify.token, 'reset_pass.mjml', setting.lost_pass.timeout)
      }
      if (type === 'mobile') {
        VerifyProxy.sendMobile(user.mobile!, verify.token, 'password')
      }
      return res.api({ result: true })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   *  重置密码
   */
  @Router({ method: 'put', path: '/resetpwd/:type(email|mobile)' })
  @Filter( passportFilter.resetpwd )
  public async resetpwd (resetpwd: PassportAPI.restPwd, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type, document, setting } = resetpwd
    let { name, code } = document
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    let VerifyProxy = verifyProxy(errorState)
    try {
      let user = await UserProxy.Dao.findOne({ [type]: name }) as ResponseUserDocument
      if (!user) {
        return res.api(null, __ErrorCode.ERROR_FINDUSER_NOTEXIST)
      }
      let result = await VerifyProxy.resetPwd(document, type, setting.lost_pass.timeout)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 验证名称是否占用
   */
  @Router({ method: 'put', path: '/check/:type(username|email|mobile)' })
  public async check (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { name } = req.body
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    let warnings: PassportAPI.checkWarning = {
      username  : __ErrorCode.ERROR_VALID_USERNAME_UNIQUE,
      email     : __ErrorCode.ERROR_VALID_EMAIL_UNIQUE,
      mobile    : __ErrorCode.ERROR_VALID_MOBILE_UNIQUE
    }
    try {
      let user = await UserProxy.Dao.findOne({ [type]: name })
      return res.api(!user, user ? warnings[type] : null)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 验证邀请码
   */
  @Router({ method: 'post', path: '/invitation' })
  public async invitation (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { cdkey } = req.body as PassportAPI.ticket
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let TicketProxy = ticketProxy(errorState)
    try {
      let ticket = await TicketProxy.valid(cdkey!, { name: '邀请码', type: 'register', key: 'cdkey' })
      return res.api(ticket)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 用户注册
   */
  @Router({ method: 'post', path: '/register' })
  @Filter( passportFilter.register )
  public async register (register: PassportAPI.register, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { document, ticket, setting } = register
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    try {
      let result = await UserProxy.register(document, setting, ticket)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  
  }

}

export = PassportController