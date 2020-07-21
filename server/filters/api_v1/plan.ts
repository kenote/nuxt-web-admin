import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { loadError } from '~/utils/error'
import __ErrorCode from '~/utils/error/code'
import { language } from '~/config'
import { ResponseUserDocument } from '@/types/proxys/user'
import { oc } from 'ts-optchain'
import { Filter, asyncFilterData } from 'kenote-validate-helper'
import { filterUserLevel } from '~/middleware/auth'
import { CreatePlanDocument, EditPlanDocument, ResponsePlanDocument } from '@/types/proxys/plan'
import { isMongoId } from 'validator'
import { UpdateDocument } from '@/types/proxys'
import planProxy from '~/proxys/plan'
import { formatArray } from '@/utils'

class PlanFilter {

  public async getlist (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type, channel } = req.params
    let auth = req.user as ResponseUserDocument
    let conditions: any = {
      $or: [
        { user: auth._id },
        { 
          share_user: {
            $elemMatch: { $in: [ auth._id ] }
          },
          share: true
        }
      ]
    }
    if (type) {
      conditions.type = type
    }
    if (channel) {
      conditions.channel = channel
    }
    return next(conditions)
  }

  public async create (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { name, type, content, channel } = req.body
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    let auth = req.user as ResponseUserDocument
    let filters = [
      {
        key     : 'name',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_NAME_REQUIRED, ['标题名称'], true) }
        ],
        value   : name
      },
      {
        key     : 'type',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_NAME_REQUIRED, ['类型'], true) }
        ],
        value   : type
      },
      {
        key     : 'content',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_NAME_REQUIRED, ['内容'], true) }
        ],
        value   : content
      }
    ] as Filter[]
    try {
      let document = await asyncFilterData(filters) as CreatePlanDocument
      document.channel = channel
      document.user = auth._id
      return next(document)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async edit (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let { name, content } = req.body
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    let auth = req.user as ResponseUserDocument
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let filters = [
      {
        key     : 'name',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_NAME_REQUIRED, ['标题名称'], true) }
        ],
        value   : name
      },
      {
        key     : 'content',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_NAME_REQUIRED, ['内容'], true) }
        ],
        value   : content
      }
    ] as Filter[]
    let PlanProxy = planProxy(errorState)
    try {
      let plan = await PlanProxy.Dao.findOne({ _id }) as ResponsePlanDocument
      if (!plan) {
        return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NULL)
      }
      if (String(plan.user._id) != String(auth._id)) {
        return res.api(null, __ErrorCode.ERROR_DATA_DOESNT_BELONG_YOU)
      }
      let data = await asyncFilterData(filters) as EditPlanDocument
      data.update_at = new Date()
      let document: UpdateDocument<EditPlanDocument> = {
        conditions: {
          _id,
          user: auth._id
        },
        data
      }
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
    let conditions: any = {
      user: auth._id
    }
    let PlanProxy = planProxy(errorState)
    try {
      if (_id) {
        if (!isMongoId(_id)) {
          return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
        }
        let plan = await PlanProxy.Dao.findOne({ _id }) as ResponsePlanDocument
        if (!plan) {
          return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NULL)
        }
        if (String(plan.user._id) != String(auth._id)) {
          return res.api(null, __ErrorCode.ERROR_DATA_DOESNT_BELONG_YOU)
        }
        conditions = { ...conditions, _id }
      }
      else {
        conditions = { ...conditions, _id: { $in: formatArray(_ids || []) } }
      }
      return next(conditions)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

}

export default new PlanFilter()