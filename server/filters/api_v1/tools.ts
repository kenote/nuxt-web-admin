import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { isArray, isEmpty, compact, Dictionary } from 'lodash'
import validator from 'validator'
import { loadError } from '~/utils/error'
import __ErrorCode from '~/utils/error/code'
import { language } from '~/config'
import { oc } from 'ts-optchain'
import { Channel } from '@/types/channel'
import * as yaml from 'js-yaml'
import { Filter, asyncFilterData } from 'kenote-validate-helper'

class ToolsFilter {

  public async ip (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { ip } = req.query as Record<string, string | string[]>
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    try {
      if (!isEmpty(ip)) {
        let ips = isArray(ip) ? ip.map(String) : String(ip).split(',')
        return next(compact(ips.map(parseIP)))
      }
      else {
        return next([res.clientIP])
      }
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async http (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { fetch } = req.body
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    let filters = [
      {
        key     : 'fetch',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_NAME_REQUIRED, ['请求信息'], true) },
          { validator: isFetch, ...ErrorInfo(__ErrorCode.ERROR_VALID_NAME_FORMAT, ['请求信息', 'API'], true) }
        ],
        value   : fetch
      },
    ] as Filter[]
    try {
      let document = await asyncFilterData(filters) as Dictionary<any>
      let fetchAPI = yaml.safeLoad(oc(document).fetch('')) as Channel.api
      return next(fetchAPI)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export default new ToolsFilter()

function parseIP (value: string): string | null {
  let val = value.replace(/\s+/g, '')
  if (validator.isIP(val) || validator.isFQDN(val)) {
    return val
  }
  else if (/^\d+$/.test(val) && Number(val) >= 0 && Number(val) <= 0xffffffff) {
    return val
  }
  return null
}

function isFetch (value: string): boolean {
  let fetch = yaml.safeLoad(oc(value)('')) as Channel.api
  if (!('method' in fetch)) {
    return false
  }
  if (!('url' in fetch)) {
    return false
  }
  return true
}