import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { language } from '~/config'
import { oc } from 'ts-optchain'
import { loadError } from '~/utils/error'
import { Qqwry } from '~/utils/qqwry'
import toolsFilter from '~/filters/api_v1/tools'
import { IPInfoResponse, IPInfo } from '@/types/qqwry'

@Path('/tools')
class ToolsController extends Controller {

  @Router({ method: 'get', path: '/ip' })
  @Filter( toolsFilter.ip )
  public async ip (ips: string[], req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let { CustomError } = loadError(lang)
    try {
      let { name, version } = Qqwry
      let info: IPInfo[] = []
      for( let ip of ips) {
        info.push(Qqwry.searchIP(ip))
      }
      let data: IPInfoResponse = { name, version, info }
      return res.api(data)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export = ToolsController