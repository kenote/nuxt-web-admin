import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { language } from '~/config'
import { oc } from 'ts-optchain'
import { loadError } from '~/utils/error'
import { authenticate, permission } from '~/middleware/auth'
import __ErrorCode from '~/utils/error/code'
import { ResponseUserDocument } from '@/types/proxys/user'
import { ResponseGroupDocument, CreateGroupDocument, EditGroupDocument } from '@/types/proxys/group'
import { QueryOptions, UpdateWriteResult, DeleteWriteResult } from 'kenote-mongoose-helper'
import groupProxy from '~/proxys/group'
import groupFilter from '~/filters/api_v1/group'
import { UpdateDocument, QueryDocument, RemoveOptions } from '@/types/proxys'

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

  /**
   * 创建用户组
   */
  @Router({ method: 'post', path: '/group/create' })
  @Filter( authenticate, permission('/ucenter/group', 'create'), groupFilter.create )
  public async create (document: CreateGroupDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let GroupProxy = groupProxy(errorState)
    try {
      let group = await GroupProxy.create(document)
      return res.api(group)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑用户组
   */
  @Router({ method: 'post', path: '/group/edit/:_id' })
  @Filter( authenticate, permission('/ucenter/group', 'edit'), groupFilter.edit )
  public async edit (edit: UpdateDocument<EditGroupDocument>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = edit
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let GroupProxy = groupProxy(errorState)
    try {
      let result = await GroupProxy.update(conditions, data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 删除用户组
   */
  @Router({ method: 'delete', path: '/group/:_id' })
  @Filter( authenticate, permission('/ucenter/group', 'remove'), groupFilter.remove )
  public async remove (remove: QueryDocument<RemoveOptions>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, options } = remove
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let GroupProxy = groupProxy(errorState)
    try {
      let result = await GroupProxy.remove(conditions, options)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑权限
   */
  @Router({ method: 'post', path: '/group/:authority(platform|access)/:_id' })
  @Filter( authenticate, permission('/ucenter/group', 'edit'), groupFilter.authority )
  public async authority (edit: UpdateDocument<EditGroupDocument>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = edit
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let GroupProxy = groupProxy(errorState)
    try {
      let result = await GroupProxy.update(conditions, data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export = GroupController