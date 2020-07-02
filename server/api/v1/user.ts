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
import { QueryDocument } from '@/types/proxys'
import { QueryOptions } from 'kenote-mongoose-helper'

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
}

export = UserController