import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { language } from '~/config'
import { oc } from 'ts-optchain'
import { loadError } from '~/utils/error'
import { authenticate, permission } from '~/middleware/auth'
import __ErrorCode from '~/utils/error/code'
import userProxy from '~/proxys/user'
import userFilter from '~/filters/api_v1/user'
import { QueryDocument, UpdateDocument } from '@/types/proxys'
import { QueryOptions } from 'kenote-mongoose-helper'
import { ResponseUserDocument, EditUserDocument, RegisterUserDocument, SetPassDocument } from '@/types/proxys/user'
import { randomPassword } from '@/utils'
import { omit } from 'lodash'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { Register, Security } from '@/types/restful'
import verifyProxy from '~/proxys/verify'

@Path('/ucenter')
class UserController extends Controller {

  /**
   * 用户列表
   */
  @Router({ method: 'post', path: '/user/list' })
  @Filter( authenticate, permission('/ucenter/user', 'list'), userFilter.getlist )
  public async getlist (findUser: QueryDocument<QueryOptions>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, options } = findUser
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    try {
      let userData = await UserProxy.Dao.list(conditions, options)
      return res.api(userData)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑用户信息
   */
  @Router({ method: 'post', path: '/user/edit/:_id' })
  @Filter( authenticate, permission('/ucenter/user', 'edit'), userFilter.edit )
  public async edit (edit: UpdateDocument<EditUserDocument>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = edit
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    try {
      let result = await UserProxy.Dao.updateOne(conditions, data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 创建新用户
   */
  @Router({ method: 'post', path: '/user/create' })
  @Filter( authenticate, permission('/ucenter/user', 'create'), userFilter.create )
  public async create (document: EditUserDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    let register: RegisterUserDocument = {
      ...document,
      username: document.username!,
      group: document.group!,
      password: randomPassword()
    }
    try {
      let user = await UserProxy.create(register) as ResponseUserDocument
      await UserProxy.sendNewUser(user, register.password)
      return res.api(omit(user, ['encrypt', 'salt']))
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 删除用户账号
   */
  @Router(
    { method: 'delete', path: '/user/:_id' },
    { method: 'delete', path: '/user' }
  )
  @Filter( authenticate, permission('/ucenter/user', 'remove'), userFilter.remove )
  public async remove (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    try {
      let result = await UserProxy.remove(conditions)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 修改用户密码
   */
  @Router({ method: 'post', path: '/user/setpass/:_id' })
  @Filter( authenticate, permission('/ucenter/user', 'edit'), userFilter.setpass )
  public async setpass (setpass: UpdateDocument<SetPassDocument>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = setpass
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    try {
      let result = await UserProxy.setPassword(conditions, data)
      await UserProxy.sendPassword(data.user!, data.password)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 发送激活邮件
   */
  @Router({ method: 'get', path: '/user/email_verify/:_id' })
  @Filter( authenticate, permission('/ucenter/user', 'edit') )
  public async sendVerifyEmail (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let setting = loadData('config/register') as Register.config
    let UserProxy = userProxy(errorState)
    let VerifyProxy = verifyProxy(errorState)
    try {
      let user = await UserProxy.Dao.findOne({ _id, binds: { $ne: 'email' } }) as ResponseUserDocument
      if (!user) {
        return res.api(null, __ErrorCode.ERROR_AUTH_OPERATE_USER_NULL)
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
}

export = UserController