import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { language } from '~/config'
import { oc } from 'ts-optchain'
import { loadError } from '~/utils/error'
import { authenticate, setToken, authPayload } from '~/middleware/auth'
import passportFilter from '~/filters/api_v1/passport'
import * as PassportAPI from '@/types/apis/passport'
import userProxy, { userBaseField } from '~/proxys/user'
import { ResponseUserDocument } from '@/types/proxys/user'

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

}

export = PassportController