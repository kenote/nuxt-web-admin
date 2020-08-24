import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { PageInfo } from '@/types/restful'
import { toPageInfo } from '~/utils'
import { FindUserType } from '@/types/proxys/user'
import { userBaseField } from '~/proxys/user'
import { oc } from 'ts-optchain'
import { QueryDocument, UpdateDocument } from '@/types/proxys'
import { QueryOptions } from 'kenote-mongoose-helper'
import { loadError } from '~/utils/error'
import __ErrorCode from '~/utils/error/code'
import { language } from '~/config'
import validator from 'validator'
import { filterUserLevel } from '~/middleware/auth'
import { ResponseUserDocument, EditUserDocument, SetPassDocument } from '@/types/proxys/user'
import { Maps } from 'kenote-config-helper'
import * as Ucenter from '@/types/apis/ucenter'
import userProxy from '~/proxys/user'
import { omit, map } from 'lodash'
import { ruleJudgment } from '@/utils/query'
import { Security } from '@/types/restful'

class UserFilter {

  public async getlist (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { page, limit, skip } = toPageInfo(req.body.page, req.body.size || 15)
    let { create_at, groups, findname, sort } = req.body
    let conditions: any = {}
    if (findname) {
      let findtype = oc(req).body.findtype('username') as FindUserType
      conditions[findtype] = new RegExp(findname)
    }
    if (Array.isArray(groups) && groups.length > 0) {
      conditions.group = { $in: groups }
    }
    if (Array.isArray(create_at)) {
      let [ begin, end ] = create_at
      if (begin && end) {
        conditions.create_at = { $gte: begin, $lt: end }
      }
    }
    let findDocument: QueryDocument<QueryOptions> = {
      conditions,
      options: {
        limit,
        skip,
        select: userBaseField
      }
    }
    let [ prop, order ] = oc(Array.isArray(sort) ? sort : [ sort ])([])
    if (order) {
      findDocument.options.sort = { [prop]: /^(desc)/.test(order) ? -1 : 0 }
    }
    return next(findDocument)
  }

  public async edit (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    if (!validator.isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    let auth = req.user as ResponseUserDocument
    let doc: UpdateDocument<EditUserDocument> = {
      conditions: { _id },
      data: getUserDocument(req.body)
    }
    let UserProxy = userProxy(errorState)
    try {
      let user = await UserProxy.Dao.findOne(doc.conditions) as ResponseUserDocument
      if (!user) {
        return res.api(null, __ErrorCode.ERROR_AUTH_OPERATE_USER_NULL)
      }
      filterUserLevel(auth, user.group.level, 9000, ErrorInfo)
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async create (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    let auth = req.user as ResponseUserDocument
    try {
      filterUserLevel(auth, 0, 9000, ErrorInfo)
      let document = getUserDocument(req.body)
      return next(document)
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
    let UserProxy = userProxy(errorState)
    let conditions = {}
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
      if (_id) {
        let user = await UserProxy.Dao.findOne(conditions) as ResponseUserDocument
        if (!user) {
          return res.api(null, __ErrorCode.ERROR_AUTH_OPERATE_USER_NULL)
        }
        filterUserLevel(auth, user.group.level, 9000, ErrorInfo)
      }
      else {
        let users = await UserProxy.Dao.find(conditions) as ResponseUserDocument[]
        let filterUsers = users.filter( o => ruleJudgment(o, { 'group.level': { $lt: auth.group.level } }))
        conditions = { _id: { $in: map(filterUsers, '_id') }}
      }
      return next(conditions)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async setpass (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let { password } = req.body as Security.setPassword
    if (!validator.isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    let auth = req.user as ResponseUserDocument
    let doc: UpdateDocument<SetPassDocument> = {
      conditions: { _id },
      data: { password }
    }
    let UserProxy = userProxy(errorState)
    try {
      let user = await UserProxy.Dao.findOne(doc.conditions) as ResponseUserDocument
      if (!user) {
        return res.api(null, __ErrorCode.ERROR_AUTH_OPERATE_USER_NULL)
      }
      doc.data.user = user
      filterUserLevel(auth, user.group.level, 9000, ErrorInfo)
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export default new UserFilter()

function getUserDocument (body: Ucenter.createUser): EditUserDocument {
  let { username, nickname, email, mobile, binds, sex, group } = body
  return { username, nickname, email, mobile, binds, sex, group }
}