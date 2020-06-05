import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { oc } from 'ts-optchain'
import { Filter, asyncFilterData } from 'kenote-validate-helper'
import * as PassportAPI from '@/types/apis/passport'
import { loadError } from '~/utils/error'
import __ErrorCode from '~/utils/error/code'
import { language } from '~/config'

class PassportFilter {

  public async login (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { username, password } = req.body as PassportAPI.login
    let lang = oc(req).query.lang('') as string || language
    let { ErrorInfo } = loadError(lang)
    let filters = [
      {
        key     : 'username',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_USERNAME_REQUIRED, null, true) }
        ],
        value   : username
      },
      {
        key     : 'password',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_PASSWORD_REQUIRED, null, true) }
        ],
        value   : password
      }
    ] as Filter[]
    try {
      let document = await asyncFilterData(filters)
      return next(document)
    } catch (error) {
      return res.api(null, error)
    }
  }
}

export default new PassportFilter()