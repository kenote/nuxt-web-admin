import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { language } from '~/config'
import { oc } from 'ts-optchain'
import { loadError } from '~/utils/error'
import alicloudFilter from '~/filters/api_v1/alicloud'
import Alicloud from '@/types/alicloud'
import AlicloudClient from '~/utils/alicloud'
import { authenticate } from '~/middleware/auth'

@Path('/alicloud')
class AlicloudController extends Controller {

  /**
   * 阿里云服务
   */
  @Router({ method: 'post', path: '/:endpoint/:action' })
  @Filter( authenticate, alicloudFilter.send )
  public async send (document: Alicloud.document, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { config, action, params } = document
    let lang = oc(req).query.lang('') as string || language
    let { CustomError } = loadError(lang)
    try {
      let client = new AlicloudClient({ setting: config })
      let result = await client.send(action, params)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export = AlicloudController