import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { language } from '~/config'
import { oc } from 'ts-optchain'
import { loadError } from '~/utils/error'
import { authenticate, permission } from '~/middleware/auth'
import __ErrorCode from '~/utils/error/code'
import { ResponseUserDocument } from '@/types/proxys/user'
import { ResponseGroupDocument } from '@/types/proxys/group'
import groupProxy from '~/proxys/group'
import ticketProxy from '~/proxys/ticket'
import { map } from 'lodash'
import ticketFilter from '~/filters/api_v1/ticket'
import { CreateTicketDocument } from '@/types/proxys/ticket'

@Path('/ucenter')
class TicketController extends Controller {

  /**
   * 获取列表
   */
  @Router({ method: 'get', path: '/ticket/list'})
  @Filter( authenticate, permission('/ucenter/ticket', 'list') )
  public async getlist (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let auth = req.user as ResponseUserDocument
    let GroupProxy = groupProxy(errorState)
    let TicketProxy = ticketProxy(errorState)
    try {
      let groups = await GroupProxy.Dao.find({ level: { $lte: auth.group.level }}) as ResponseGroupDocument[]
      let tickets = await TicketProxy.Dao.find({ type: 'register', 'setting.group': { $in: map(groups, '_id') } })
      return res.api(tickets)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 创建邀请码
   */
  @Router({ method: 'post', path: '/ticket/create' })
  @Filter( authenticate, permission('/ucenter/ticket', 'create'), ticketFilter.create )
  public async create (document: CreateTicketDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let TicketProxy = ticketProxy(errorState)
    try {
      let ticket = await TicketProxy.create(document)
      return res.api(ticket)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 删除邀请码
   */
  @Router(
    { method: 'delete', path: '/ticket/:_id' },
    { method: 'delete', path: '/ticket' }
  )
  @Filter( authenticate, permission('/ucenter/ticket', 'remove'), ticketFilter.remove )
  public async remove (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let TicketProxy = ticketProxy(errorState)
    try {
      let result = await TicketProxy.Dao.remove(conditions)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

}

export = TicketController