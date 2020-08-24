import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { loadError } from '~/utils/error'
import __ErrorCode from '~/utils/error/code'
import { language } from '~/config'
import validator from 'validator'
import { filterUserLevel } from '~/middleware/auth'
import { oc } from 'ts-optchain'
import { ResponseUserDocument } from '@/types/proxys/user'
import * as Ucenter from '@/types/apis/ucenter'
import { Filter, asyncFilterData } from 'kenote-validate-helper'
import { isDate } from 'lodash'
import groupProxy from '~/proxys/group'
import { ResponseGroupDocument } from '@/types/proxys/group'
import { CreateTicketDocument } from '@/types/proxys/ticket'

class TicketFilter {

  public async create (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { group, last_at, stint } = req.body as Ucenter.createTicket
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    let auth = req.user as ResponseUserDocument
    let filters = [
      {
        key: 'group',
        rules: [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_GROUP_REQUIRED, null, true) }
        ],
        value: group
      },
      {
        key: 'last_at',
        rules: [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_DATE_REQUIRED, ['过期时间'], true) },
          { validator: (value: string) => isDate(new Date(value)), ...ErrorInfo(__ErrorCode.ERROR_VALID_DATE_FORMAT, ['过期时间'], true) }
        ],
        value: last_at
      }
    ] as Filter[]
    let GroupProxy = groupProxy(errorState)
    try {
      let document = await asyncFilterData(filters) as Ucenter.createTicket
      let group = await GroupProxy.Dao.findOne({ _id: document.group }) as ResponseGroupDocument
      if (!group) {
        return res.api(null, __ErrorCode.ERROR_VALID_GROUP_NOTEXIST)
      }
      filterUserLevel(auth, group.level, 9998, ErrorInfo)
      let body = getTicketDocument({ ...document, stint, group })
      return next(body)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async remove (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let { _ids } = req.body
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    let auth = req.user as ResponseUserDocument
    let conditions: any = {}
    if (_id) {
      if (!validator.isMongoId(_id)) {
        return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
      }
      conditions = { _id }
    }
    else {
      conditions = { _id: { $in: Array.isArray(_ids) ? _ids : [] } }
    }
    try {
      filterUserLevel(auth, 0, 9998, ErrorInfo)
      return next(conditions)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export default new TicketFilter()

function getTicketDocument (body: any): CreateTicketDocument {
  let { group } = body
  let type: string = 'register'
  let setting: any = { group: group._id }
  let name: string = `注册 -> ${group.name}`
  let stint: number = Number(body.stint | 1)
  let last_at: Date = new Date(body.last_at)
  return { type, setting, name, stint, last_at }
}