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
import ticketProxy from '~/proxys/ticket'
import groupProxy from '~/proxys/group'
import { ResponseTicketDocument } from '@/types/proxys/ticket'
import { RegisterUserDocument, ResponseUserDocument, EditUserDocument } from '@/types/proxys/user'
import { QueryDocument, UpdateDocument } from '@/types/proxys'
import * as Ucenter from '@/types/apis/ucenter'
import { pick, map, intersection } from 'lodash'

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
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VERIFY_CODE_REQUIRED, null, true) }
        ],
        value   : code
      },
      {
        key     : 'password',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_PASSWORD_REQUIRED, null, true) },
          { pattern: /^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/, ...ErrorInfo(__ErrorCode.ERROR_VALID_PASSWORD_FORMAT, null, true) }
        ],
        value   : password
      }
    ] as Filter[]
    type === 'email' && filters.push({
      key     : 'name',
      rules   : [
        { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_EMAIL_REQUIRED, null, true) },
        { validator: isEmail, ...ErrorInfo(__ErrorCode.ERROR_VALID_EMAIL_FORMAT, null, true) }
      ],
      value   : name
    } as Filter)
    type === 'mobile' && filters.push({
      key     : 'name',
      rules   : [
        { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_MOBILE_REQUIRED, null, true) },
        { validator: value => isMobilePhone(value, 'zh-CN'), ...ErrorInfo(__ErrorCode.ERROR_VALID_MOBILE_FORMAT, null, true) }
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

  public async register (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { username, email, mobile, password, invitation } = req.body as PassportAPI.registerDocument
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo } = errorState
    let TicketProxy = ticketProxy(errorState)
    let GroupProxy = groupProxy(errorState)
    let filters = [
      {
        key: 'username',
        rules: [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_USERNAME_REQUIRED, null, true) },
          { pattern: /^[a-zA-Z]{1}[a-zA-Z0-9\_\-]{4,19}$/, ...ErrorInfo(__ErrorCode.ERROR_VALID_USERNAME_FORMAT, null, true)  }
        ],
        value: username
      },
      {
        key: 'email',
        rules: [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_EMAIL_REQUIRED, null, true) },
          { validator: isEmail, ...ErrorInfo(__ErrorCode.ERROR_VALID_EMAIL_FORMAT, null, true) }
        ],
        value: email
      },
      {
        key: 'password',
        rules: [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_PASSWORD_REQUIRED, null, true) },
          { pattern: /^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/, ...ErrorInfo(__ErrorCode.ERROR_VALID_PASSWORD_FORMAT, null, true) }
        ],
        value: password
      }
    ] as Filter[]
    let setting = loadData('config/register') as Register.config
    try {
      let ticket: ResponseTicketDocument | null = null
      if (setting.invitation) {
        ticket = await TicketProxy.valid(invitation!, { name: '邀请码', type: 'register', key: 'cdkey' })
      }
      let document = await asyncFilterData(filters) as RegisterUserDocument
      if (ticket) {
        let ticketSetting = oc(ticket).setting({})
        document.group = ticketSetting['group']
        if (ticketSetting['teams']) {
          document.teams = ticketSetting['teams']
        }
      }
      else {
        let group = await GroupProxy.defaultGroup()
        document.group = group._id
      }
      return next({ document, ticket, setting })
    } catch (error) {
      return res.api(null, error)
    }
  }

  public async verify_email_mobile (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { token, id } = req.body as PassportAPI.verifyBaseDocument
    let warnings: PassportAPI.verifyWarning = {
      email: {
        timeout : __ErrorCode.ERROR_VERIFY_EMAIL_TIMEOUT,
        failed  : __ErrorCode.ERROR_VERIFY_EMAIL_FAILED
      },
      mobile: {
        timeout : __ErrorCode.ERROR_VERIFY_MOBILE_TIMEOUT,
        failed  : __ErrorCode.ERROR_VERIFY_MOBILE_FAILED
      }
    }
    let setting = loadData('config/register') as Register.config
    return next({ setting, warnings, document: { type, token, id } })
  }

  public async baseinfo (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let auth = req.user as ResponseUserDocument
    let doc: UpdateDocument<EditUserDocument> = {
      conditions: { _id: auth._id },
      data: getUserDocument(req.body, auth)
    }
    return next(doc)
  }
}

export default new PassportFilter()

function getUserDocument (body: Ucenter.createUser, auth: ResponseUserDocument): EditUserDocument {
  let { nickname, sex, teams } = body
  let teamsValues = intersection(map(auth.teams, '_id').map(String), teams || [])
  return { nickname, sex, teams: teamsValues }
}