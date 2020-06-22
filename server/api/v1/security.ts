import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { language } from '~/config'
import { oc } from 'ts-optchain'
import { loadError } from '~/utils/error'
import { authenticate } from '~/middleware/auth'
import userProxy from '~/proxys/user'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { Register, Security } from '@/types/restful'
import { ResponseUserDocument } from '@/types/proxys/user'
import verifyProxy from '~/proxys/verify'
import __ErrorCode from '~/utils/error/code'
import securityFilter from '~/filters/api_v1/security'
import * as PassportAPI from '@/types/apis/passport'

@Path('/security')
class SecurityController extends Controller {

  /**
   * 发送验证邮件
   */
  @Router({ method: 'get', path: '/email_verify' })
  @Filter( authenticate )
  public async sendVerifyEmail (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let setting = loadData('config/register') as Register.config
    let UserProxy = userProxy(errorState)
    let VerifyProxy = verifyProxy(errorState)
    try {
      let user = req.user as ResponseUserDocument
      if (req.user) {
        user = await UserProxy.Dao.findOne({ _id: req.user }) as ResponseUserDocument
        if (!user) {
          return res.api(null, __ErrorCode.ERROR_AUTH_OPERATE_USER_NULL)
        }
      }
      await VerifyProxy.Dao.remove({ type: 'email', user: user._id })
      await UserProxy.sendEmailVerify(user, setting.email_verify.timeout)
      return res.api(null)
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
  @Router({ method: 'put', path: '/sendcode/:type(email|mobile)' })
  @Filter( authenticate, securityFilter.sendCode )
  public async sendCode (sendCode: PassportAPI.request<Security.sendCode>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { document, setting } = sendCode
    let { type, verify_id, name } = document
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let VerifyProxy = verifyProxy(errorState)
    try {
      let user = req.user as ResponseUserDocument
      let verify = await VerifyProxy.generate({ user: user._id }, setting.mailphone_step, document)
      if (type === 'email') {
        if (verify_id) {
          user.email = name!
        }
        VerifyProxy.sendMail(verify_id ? '邮箱校验' : '帐号身份校验', user, verify.token, 'send_code.mjml', setting.lost_pass.timeout)
      }
      if (type === 'mobile') {
        VerifyProxy.sendMobile(verify_id ? name! : user.mobile!, verify.token, verify_id ? 'setinfos' : 'verifyid')
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
   * 校验验证码
   */
  @Router({ method: 'post', path: '/verifycode' })
  @Filter( authenticate )
  public async verifyCode (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { code } = req.body as Security.verifyCode
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let setting = loadData('config/register') as Register.config
    let VerifyProxy = verifyProxy(errorState)
    try {
      let user = req.user as ResponseUserDocument
      let verify = await VerifyProxy.check({ user: user._id, code }, setting.lost_pass.timeout)
      return res.api({ _id: verify._id })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 修改密码
   */
  @Router({ method: 'post', path: '/setpassword' })
  @Filter( authenticate, securityFilter.setPassword )
  public async setPassword (setPassword: PassportAPI.request<Security.setPassword>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { document, setting } = setPassword
    let { verify_id } = document
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    let VerifyProxy = verifyProxy(errorState)
    try {
      let user = req.user as ResponseUserDocument
      let verify = await VerifyProxy.check({ user: user._id }, setting.lost_pass.timeout, verify_id!)
      let result = await UserProxy.setPassword({ _id: user._id }, document)
      await VerifyProxy.Dao.remove({ _id: verify._id })
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
  @Filter( authenticate )
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
      let auth = req.user as ResponseUserDocument
      let user = await UserProxy.Dao.findOne({ [type]: { $eq: name, $ne: auth[type] } })
      return res.api(!user, user ? warnings[type] : null)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 设置邮箱
   */
  @Router({ method: 'post', path: '/setemail' })
  @Filter( authenticate, securityFilter.setEmail )
  public async setEmail (setEmail: PassportAPI.request<Security.setEmail>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { document, setting } = setEmail
    let { verify_id, code, email } = document
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    let VerifyProxy = verifyProxy(errorState)
    try {
      let user = req.user as ResponseUserDocument
      let verify = await VerifyProxy.check({ user: user._id }, setting.lost_pass.timeout, verify_id!)
      if (verify.token !== code) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_CODE_FAILED)
      }
      let result = await UserProxy.Dao.updateOne({ _id: user._id }, { email, binds: Array.from(new Set([ ...user.binds, 'email' ])) })
      await VerifyProxy.Dao.remove({ _id: verify._id })
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 设置手机
   */
  @Router({ method: 'post', path: '/setmobile' })
  @Filter( authenticate, securityFilter.setMobile )
  public async setMobile (setMobile: PassportAPI.request<Security.setMobile>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { document, setting } = setMobile
    let { verify_id, code, mobile } = document
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    let VerifyProxy = verifyProxy(errorState)
    try {
      let user = req.user as ResponseUserDocument
      let verify = await VerifyProxy.check({ user: user._id }, setting.lost_pass.timeout, verify_id!)
      if (verify.token !== code) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_CODE_FAILED)
      }
      let result = await UserProxy.Dao.updateOne({ _id: user._id }, { mobile, binds: Array.from(new Set([ ...user.binds, 'mobile' ])) })
      await VerifyProxy.Dao.remove({ _id: verify._id })
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

}

export = SecurityController