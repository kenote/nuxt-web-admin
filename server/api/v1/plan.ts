import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { language } from '~/config'
import { oc } from 'ts-optchain'
import { loadError } from '~/utils/error'
import { authenticate, permission } from '~/middleware/auth'
import planFilter from '~/filters/api_v1/plan'
import planProxy from '~/proxys/plan'
import { CreatePlanDocument, EditPlanDocument, ResponsePlanDocument, Bookmark } from '@/types/proxys/plan'
import { UpdateDocument } from '@/types/proxys'
import { ResponseUserDocument } from '@/types/proxys/user'
import * as yaml from 'js-yaml'
import { HttpRequestConfig } from '@/utils/http'

@Path('/plan')
class PlanController extends Controller {

  /**
   * 获取用户收藏、草稿列表
   */
  @Router(
    { method: 'get', path: '/list' },
    { method: 'get', path: '/list/:type' },
    { method: 'get', path: '/list/:type/:channel' }
  )
  @Filter( authenticate, planFilter.getlist )
  public async getlist (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let PlanProxy = planProxy(errorState)
    try {
      let result = await PlanProxy.Dao.find(conditions)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 创建用户收藏、草稿
   */
  @Router({ method: 'post', path: '/create' })
  @Filter( authenticate, planFilter.create )
  public async create (document: CreatePlanDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let PlanProxy = planProxy(errorState)
    try {
      let plan = await PlanProxy.Dao.insert(document)
      return res.api(plan)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑用户收藏、草稿
   */
  @Router({ method: 'post', path: '/edit/:_id' })
  @Filter( authenticate, planFilter.edit )
  public async edit (document: UpdateDocument<EditPlanDocument>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = document
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let PlanProxy = planProxy(errorState)
    try {
      let result = await PlanProxy.Dao.updateOne(conditions, data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 删除用户收藏、草稿
   */
  @Router(
    { method: 'delete', path: '/:_id' },
    { method: 'delete', path: '' }
  )
  @Filter( authenticate, planFilter.remove )
  public async remove (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let PlanProxy = planProxy(errorState)
    try {
      let result = await PlanProxy.Dao.remove(conditions)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 获取个人书签
   */
  @Router({ method: 'get', path: '/bookmark' })
  @Filter( authenticate )
  public async bookmark (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let auth = req.user as ResponseUserDocument
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let PlanProxy = planProxy(errorState)
    try {
      let data: Bookmark[] = []
      let result = await PlanProxy.Dao.findOne({ user: auth._id, type: 'bookmark', channel: 'home' }) as ResponsePlanDocument | null
      if (result) {
        let { content } = result
        data = yaml.load(content) || []
      }
      return res.api(data)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 更新个人书签
   */
  @Router({ method: 'post', path: '/bookmark' })
  @Filter( authenticate )
  public async updateBookmark (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { content } = req.body
    let auth = req.user as ResponseUserDocument
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let PlanProxy = planProxy(errorState)
    try {
      let bookmark = await PlanProxy.Dao.findOne({ user: auth._id, type: 'bookmark', channel: 'home' })
      if (bookmark) {
        await PlanProxy.Dao.updateOne({ _id: bookmark._id }, { content: String(content) })
      }
      else {
        let document: CreatePlanDocument = {
          name: '我的书签',
          type: 'bookmark', 
          channel: 'home',
          content: String(content),
          user: auth._id
        }
        await PlanProxy.Dao.insert(document)
      }
      let data: Bookmark[] = []
      let result = await PlanProxy.Dao.findOne({ user: auth._id, type: 'bookmark', channel: 'home' }) as ResponsePlanDocument | null
      if (result) {
        let { content } = result
        data = [ ...yaml.load(content) ]
      }
      return res.api(data)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 获取Http-Request
   */
  @Router({ method: 'get', path: '/http-request' })
  @Filter( authenticate )
  public async httpRequest (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let auth = req.user as ResponseUserDocument
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let PlanProxy = planProxy(errorState)
    try {
      let data: HttpRequestConfig = { httpRequest: [], httpProxy: false }
      let result = await PlanProxy.Dao.findOne({ user: auth._id, type: 'http-request', channel: 'home' }) as ResponsePlanDocument | null
      if (result) {
        let { content } = result
        data = yaml.load(content)
      }
      return res.api(data)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 更新Http-Request
   */
  @Router({ method: 'post', path: '/http-request' })
  @Filter( authenticate )
  public async updateHttpRequest (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { content } = req.body
    let auth = req.user as ResponseUserDocument
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let PlanProxy = planProxy(errorState)
    try {
      let bookmark = await PlanProxy.Dao.findOne({ user: auth._id, type: 'http-request', channel: 'home' })
      if (bookmark) {
        await PlanProxy.Dao.updateOne({ _id: bookmark._id }, { content: String(content) })
      }
      else {
        let document: CreatePlanDocument = {
          name: 'http-request',
          type: 'http-request', 
          channel: 'home',
          content: String(content),
          user: auth._id
        }
        await PlanProxy.Dao.insert(document)
      }
      let data: HttpRequestConfig = { httpRequest: [], httpProxy: false }
      let result = await PlanProxy.Dao.findOne({ user: auth._id, type: 'http-request', channel: 'home' }) as ResponsePlanDocument | null
      if (result) {
        let { content } = result
        data = yaml.load(content)
      }
      return res.api(data)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }


}

export = PlanController