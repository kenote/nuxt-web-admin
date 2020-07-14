import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { language } from '~/config'
import { oc } from 'ts-optchain'
import { loadError } from '~/utils/error'
import { authenticate, permission } from '~/middleware/auth'
import __ErrorCode from '~/utils/error/code'
import teamFilter from '~/filters/api_v1/team'
import teamProxy from '~/proxys/team'
import { CreateTeamDocument, EditTeamDocument } from '@/types/proxys/team'
import { UpdateDocument, QueryDocument, RemoveOptions } from '@/types/proxys'
import { QueryOptions } from 'kenote-mongoose-helper'
import userProxy from '~/proxys/user'
import groupProxy from '~/proxys/group'
import { ResponseGroupDocument } from '@/types/proxys/group'
import { map } from 'lodash'
import { ResponseUserDocument } from '@/types/proxys/user'

@Path('/ucenter')
class TeamController extends Controller {

  /**
   * 团队列表
   */
  @Router(
    { method: 'get', path: '/team/list' },
    { method: 'get', path: '/team/list/:channel' }
  )
  @Filter( authenticate, permission('/ucenter/team', 'list'), teamFilter.getlist )
  public async getlist (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let TeamProxy = teamProxy(errorState)
    try {
      let teams = await TeamProxy.Dao.find(conditions)
      return res.api(teams)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 创建团队
   */
  @Router({ method: 'post', path: '/team/create' })
  @Filter( authenticate, permission('/ucenter/team', 'create'), teamFilter.create )
  public async create (document: CreateTeamDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let TeamProxy = teamProxy(errorState)
    try {
      let team = await TeamProxy.Dao.insert(document)
      return res.api(team)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑团队
   */
  @Router({ method: 'post', path: '/team/edit/:_id' })
  @Filter( authenticate, permission('/ucenter/team', 'edit'), teamFilter.edit )
  public async edit (edit: UpdateDocument<EditTeamDocument>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = edit
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let TeamProxy = teamProxy(errorState)
    try {
      let result = await TeamProxy.Dao.updateOne(conditions, data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 删除团队
   */
  @Router({ method: 'delete', path: '/team/:_id' })
  @Filter( authenticate, permission('/ucenter/team', 'remove'), teamFilter.remove )
  public async remove (remove: QueryDocument<RemoveOptions>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions } = remove
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let TeamProxy = teamProxy(errorState)
    try {
      let result = await TeamProxy.remove(conditions)
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
  @Router({ method: 'post', path: '/team/:authority(platform|access)/:_id' })
  @Filter( authenticate, permission('/ucenter/team', 'edit'), teamFilter.authority )
  public async authority (edit: UpdateDocument<EditTeamDocument>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = edit
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let TeamProxy = teamProxy(errorState)
    try {
      let result = await TeamProxy.Dao.updateOne(conditions, data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑团队线路
   */
  @Router({ method: 'put', path: '/team/rtsps/:_id' })
  @Filter( authenticate, permission('/ucenter/team', 'edit'), teamFilter.rtsps )
  public async rtsps (edit: UpdateDocument<EditTeamDocument>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = edit
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let TeamProxy = teamProxy(errorState)
    try {
      let result = await TeamProxy.Dao.updateOne(conditions, data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 获取团队成员
   */
  @Router({ method: 'post', path: '/team/people/:_id' })
  @Filter( authenticate )
  public async people (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let options: QueryOptions = {
      select: ['id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'group', 'teams' ],
      populate: [
        {
          path: 'group',
          select: ['id', 'name', 'level', 'description']
        },
        {
          path: 'teams',
          select: ['id', 'name', 'description']
        }
      ]
    }
    let UserProxy = userProxy(errorState)
    try {
      let users = await UserProxy.Dao.find({ teams: _id }, options)
      return res.api(users)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 检索可选用户
   */
  @Router({ method: 'get', path: '/team/invitee_suggestions/:_id' })
  @Filter( authenticate )
  public async invitee_suggestions (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let { q } = req.query
    if (!q) return res.api([])
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let options: QueryOptions = {
      select: ['id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'group', 'teams' ],
      populate: [
        {
          path: 'group',
          select: ['id', 'name', 'level', 'description']
        },
        {
          path: 'teams',
          select: ['id', 'name', 'description']
        }
      ],
      limit: 10
    }
    let GroupProxy = groupProxy(errorState)
    let UserProxy = userProxy(errorState)
    try {
      let groups = await GroupProxy.Dao.find({ level: { $lt: 8000 } }) as ResponseGroupDocument[]
      let conditions: any = {
        $or: [
          { username  : new RegExp(q as string) },
          { email     : new RegExp(q as string) },
          { mobile    : new RegExp(q as string) },
          { nickname  : new RegExp(q as string) }
        ],
        teams: { $ne: _id }
        // group: { $in: map(groups, '_id') }
      }
      let users = await UserProxy.Dao.find(conditions, options)
      return res.api(users)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 设置团队成团
   */
  @Router({ method: 'post', path: '/team/people/:_id/set'})
  @Filter( authenticate, permission('/ucenter/team', 'edit'), teamFilter.setPeoples )
  public async setPeoples (document: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id, peoples } = document as { _id: string, peoples: string[] }
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    try {
      let users = await UserProxy.Dao.find({ teams: _id }) as ResponseUserDocument[]
      let oldUsers = map(users, '_id')
      let remove = oldUsers.filter( o => !peoples.includes(o))
      await UserProxy.Dao.update({ _id: { $in: remove } }, { $pull: { teams: _id } })
      let addset = peoples.filter( o => !oldUsers.includes(o) )
      let result = await UserProxy.Dao.update({ _id: { $in: addset } }, { $addToSet: { teams: _id } }, { multi: true })
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 移除团队成员
   */
  @Router({ method: 'delete', path: '/team/people/:_id' })
  @Filter( authenticate, permission('/ucenter/team', 'edit'), teamFilter.setPeoples )
  public async removePeople (document: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id, peoples } = document as { _id: string, peoples: string[] }
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let UserProxy = userProxy(errorState)
    try {
      let result = await UserProxy.Dao.update({ _id: { $in: peoples }}, { $pull: { teams: _id }})
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

}

export = TeamController