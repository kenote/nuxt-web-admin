import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { Request, Response, NextFunction } from 'express'
import { authenticate } from '~/middleware/auth'
import { IResponse } from '~/middleware/restful'

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
  

}

export = PassportController