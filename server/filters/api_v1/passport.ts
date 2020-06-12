import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { oc } from 'ts-optchain'
import { Filter, asyncFilterData } from 'kenote-validate-helper'
import * as PassportAPI from '@/types/apis/passport'
import { loadError } from '~/utils/error'
import __ErrorCode from '~/utils/error/code'
import { language } from '~/config'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { Register } from '@/types/restful'
import { isEmail, isMobilePhone } from 'validator'

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

  public async resetpwdCode (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { name } = req.body as PassportAPI.inputValue
    let setting = loadData('config/register') as Register.config
    return next({ type, document: { name }, setting })
  }

  public async resetpwd (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { code, name, password } = req.body as PassportAPI.resetPwdDocument
    let lang = oc(req).query.lang('') as string || language
    let { ErrorInfo } = loadError(lang)
    let filters = [
      {
        key     : 'code',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VERIFY_CODE_REQUIRED) }
        ],
        value   : code
      },
      {
        key     : 'password',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_PASSWORD_REQUIRED) },
          { pattern: /^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/, ...ErrorInfo(__ErrorCode.ERROR_VALID_PASSWORD_FORMAT) }
        ],
        value   : password
      }
    ] as Filter[]
    type === 'email' && filters.push({
      key     : 'name',
      rules   : [
        { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_EMAIL_REQUIRED) },
        { validator: isEmail, ...ErrorInfo(__ErrorCode.ERROR_VALID_EMAIL_FORMAT) }
      ],
      value   : name
    } as Filter)
    type === 'mobile' && filters.push({
      key     : 'name',
      rules   : [
        { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_MOBILE_REQUIRED) },
        { validator: value => isMobilePhone(value, 'zh-CN'), ...ErrorInfo(__ErrorCode.ERROR_VALID_MOBILE_FORMAT) }
      ],
      value   : name
    } as Filter)
    let setting = loadData('config/register') as Register.config
    try {
      let document = await asyncFilterData(filters) as PassportAPI.resetPwdDocument
      return next({ type, document, setting })
    } catch (error) {
      return res.api(null, error)
    }
  }
}

export default new PassportFilter()