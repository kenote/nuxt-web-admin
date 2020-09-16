import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { isArray, isEmpty, compact } from 'lodash'
import validator from 'validator'

class ToolsFilter {

  public async ip (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { ip } = req.query as Record<string, string | string[]>
    if (!isEmpty(ip)) {
      let ips = isArray(ip) ? ip.map(String) : String(ip).split(',')
      return next(compact(ips.map(parseIP)))
    }
    else {
      return next([res.clientIP])
    }
  }
}

export default new ToolsFilter()

function parseIP (value: string): string | null {
  let val = value.replace(/\s+/g, '')
  if (validator.isIP(val)) {
    return val
  }
  else if (/^\d+$/.test(val) && Number(val) >= 0 && Number(val) <= 0xffffffff) {
    return val
  }
  return null
}