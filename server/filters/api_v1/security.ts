import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { Register, Security } from '@/types/restful'
import { Filter, asyncFilterData, Rule } from 'kenote-validate-helper'
import * as PassportAPI from '@/types/apis/passport'
import { oc } from 'ts-optchain'
import { loadError } from '~/utils/error'
import __ErrorCode from '~/utils/error/code'
import { language } from '~/config'
import validator from 'validator'
import { VerifyGenerateOptions } from '@/types/proxys/verify'

class SecurityFilter {

  public async sendCode (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { name, verify_id } = req.body as VerifyGenerateOptions
    let setting = loadData('config/register') as Register.config
    let document: Security.sendCode = { type: type as PassportAPI.verifyUserType }
    if (!verify_id) return next({ document, setting })
    let lang = oc(req).query.lang('') as string || language
    let { ErrorInfo } = loadError(lang)
    let warnings = {
      email: [
        { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_EMAIL_REQUIRED, null, true)  },
        { validator: validator.isEmail, ...ErrorInfo(__ErrorCode.ERROR_VALID_EMAIL_FORMAT, null, true) }
      ],
      mobile: [
        { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_MOBILE_REQUIRED, null, true) },
        { validator: (value: string) => validator.isMobilePhone(value, 'zh-CN'), ...ErrorInfo(__ErrorCode.ERROR_VALID_MOBILE_FORMAT, null, true) }
      ]
    } as Record<PassportAPI.verifyUserType, Rule[]>
    let filters = [
      {
        key     : 'name',
        rules   : oc(warnings)[type]([]),
        value   : name
      },
      {
        key     : 'verify_id',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VERIFY_ID_REQUIRED, null, true) }
        ],
        value   : verify_id
      }
    ] as Filter[]
    try {
      document = await asyncFilterData(filters) as Security.sendCode
      document.type = type as PassportAPI.verifyUserType
      return next({ document, setting })
    } catch (error) {
      return res.api(null, error)
    }
  }

  public async setPassword (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { password, verify_id } = req.body as Security.setPassword
    let setting = loadData('config/register') as Register.config
    let lang = oc(req).query.lang('') as string || language
    let { ErrorInfo } = loadError(lang)
    let filters = [
      {
        key     : 'passwprd',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_PASSWORD_REQUIRED, null, true) },
          { pattern: /^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/, ...ErrorInfo(__ErrorCode.ERROR_VALID_PASSWORD_FORMAT, null, true) }
        ],
        value   : password
      },
      {
        key     : 'verify_id',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VERIFY_ID_REQUIRED, null, true) }
        ],
        value   : verify_id
      }
    ] as Filter[]
    try {
      let document = await asyncFilterData(filters) as Security.setPassword
      return next({ document, setting })
    } catch (error) {
      return res.api(null, error)
    }
  }

  public async setEmail (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { email, verify_id, code } = req.body as Security.setEmail
    let setting = loadData('config/register') as Register.config
    let lang = oc(req).query.lang('') as string || language
    let { ErrorInfo } = loadError(lang)
    let filters = [
      {
        key: 'email',
        rules: [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_EMAIL_REQUIRED, null, true) },
          { validator: validator.isEmail, ...ErrorInfo(__ErrorCode.ERROR_VALID_EMAIL_FORMAT, null, true) }
        ],
        value: email
      },
      {
        key     : 'verify_id',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VERIFY_ID_REQUIRED, null, true) }
        ],
        value   : verify_id
      },
      {
        key     : 'code',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VERIFY_CODE_REQUIRED, null, true) }
        ],
        value   : code
      },
    ] as Filter[]
    try {
      let document = await asyncFilterData(filters) as Security.setEmail
      return next({ document, setting })
    } catch (error) {
      return res.api(null, error)
    }
  }

  public async setMobile (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { mobile, verify_id, code } = req.body as Security.setMobile
    let setting = loadData('config/register') as Register.config
    let lang = oc(req).query.lang('') as string || language
    let { ErrorInfo } = loadError(lang)
    let filters = [
      {
        key: 'mobile',
        rules: [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_MOBILE_REQUIRED, null, true) },
          { validator: value => validator.isMobilePhone(value, 'zh-CN'), ...ErrorInfo(__ErrorCode.ERROR_VALID_MOBILE_FORMAT, null, true) }
        ],
        value: mobile
      },
      {
        key     : 'verify_id',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VERIFY_ID_REQUIRED, null, true) }
        ],
        value   : verify_id
      },
      {
        key     : 'code',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VERIFY_CODE_REQUIRED, null, true) }
        ],
        value   : code
      },
    ] as Filter[]
    try {
      let document = await asyncFilterData(filters) as Security.setMobile
      return next({ document, setting })
    } catch (error) {
      return res.api(null, error)
    }
  }
}

export default new SecurityFilter()