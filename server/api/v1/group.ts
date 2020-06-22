import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { language } from '~/config'
import { oc } from 'ts-optchain'
import { loadError } from '~/utils/error'
import { authenticate } from '~/middleware/auth'
import __ErrorCode from '~/utils/error/code'
import { ResponseUserDocument } from '@/types/proxys/user'
import { ResponseGroupDocument } from '@/types/proxys/group'
import { QueryOptions, UpdateWriteResult, DeleteWriteResult } from 'kenote-mongoose-helper'
import groupProxy from '~/proxys/group'

@Path('/ucenter')
class GroupController extends Controller {

  /**
   * 用户组列表
   */
  @Router({ method: 'post', path: '/group/:type(list|lite)'})
  @Filter( authenticate )
  public async getList (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { name } = req.body
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let user = req.user as ResponseUserDocument
    let conditions: any = {}
    let options: QueryOptions = {}
    if (name) {
      conditions.name = new RegExp(name)
    }
    if (type === 'lite') {
      options = {
        select: ['_id', 'name', 'level'],
        populate: { path: '' }
      }
      conditions.level = { $lt: user.group.level }
    }
    let GroupProxy = groupProxy(errorState)
    try {
      let groups = await GroupProxy.Dao.find(conditions, options)
      return res.api(groups)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export = GroupController