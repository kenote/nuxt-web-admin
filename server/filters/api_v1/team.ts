import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { loadError } from '~/utils/error'
import __ErrorCode from '~/utils/error/code'
import { language } from '~/config'
import validator from 'validator'
import { filterUserLevel } from '~/middleware/auth'
import { oc } from 'ts-optchain'
import { ResponseUserDocument } from '@/types/proxys/user'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { Channel } from '@/types/channel'
import { Filter, asyncFilterData } from 'kenote-validate-helper'
import { CreateTeamDocument, EditTeamDocument, ResponseTeamDocument } from '@/types/proxys/team'
import { UpdateDocument, RemoveOptions, QueryDocument } from '@/types/proxys'
import teamProxy from '~/proxys/team'
import { isString, pullAll, map, omit } from 'lodash'

class TeamFilter {

  public async getlist (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel } = req.params
    let lang = oc(req).query.lang('') as string || language
    let { ErrorInfo, CustomError } = loadError(lang)
    let auth = req.user as ResponseUserDocument
    let conditions: any = {}
    try {
      if (channel) {
        let channels = loadData('config/channels', 'array') as Channel.element[]
        let platform = channels.find( o => o.label === channel )
        if (platform) {
          conditions = { platform: platform.id }
        }
      }
      filterUserLevel(auth, 0, 9000, ErrorInfo)
      return next(conditions)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async create (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { name, description } = req.body
    let lang = oc(req).query.lang('') as string || language
    let { ErrorInfo, CustomError } = loadError(lang)
    let auth = req.user as ResponseUserDocument
    let filters = [
      {
        key: 'name',
        rules: [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_NAME_REQUIRED, ['团队'], true) }
        ],
        value: name
      }
    ] as Filter[]
    try {
      filterUserLevel(auth, 0, 9000, ErrorInfo)
      let document = await asyncFilterData(filters) as CreateTeamDocument
      document.description = description
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
    let { name, description } = req.body
    let lang = oc(req).query.lang('') as string || language
    let { ErrorInfo, CustomError } = loadError(lang)
    let auth = req.user as ResponseUserDocument
    let filters = [
      {
        key: 'name',
        rules: [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_NAME_REQUIRED, ['团队'], true) }
        ],
        value: name
      }
    ] as Filter[]
    try {
      filterUserLevel(auth, 0, 9000, ErrorInfo)
      let data = await asyncFilterData(filters) as CreateTeamDocument
      data.description = description
      let doc: UpdateDocument<EditTeamDocument> = {
        conditions: { _id },
        data
      }
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async remove (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let lang = oc(req).query.lang('') as string || language
    let { ErrorInfo, CustomError } = loadError(lang)
    let auth = req.user as ResponseUserDocument
    if (!validator.isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    try {
      filterUserLevel(auth, 0, 9000, ErrorInfo)
      let doc: QueryDocument<RemoveOptions> = {
        conditions: { _id },
        options: {}
      }
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async authority (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id, authority } = req.params
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    if (!validator.isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let auth = req.user as ResponseUserDocument
    let doc: UpdateDocument<EditTeamDocument> = {
      conditions: { _id },
      data: {
        [authority]: oc(req).body[authority]([])
      }
    }
    let TeamProxy = teamProxy(errorState)
    try {
      filterUserLevel(auth, 0, 9000, ErrorInfo)
      if (authority === 'platform') {
        let platforms = doc.data.platform || []
        let channels = loadData('config/channels', 'array').filter( o => platforms?.includes(o.id) ) as Channel.element[]
        let keywords = channels.map( o => o.id > 1000 ? `/project/${o.label}` : `/${o.label}`).join('|')
        let team = await TeamProxy.Dao.findOne(doc.conditions) as ResponseTeamDocument
        if (team) {
          let access = team.access.filter( o => new RegExp(`^(${keywords})`).test(o) )
          if (team.access.filter( o => !access.includes(o) ).length > 0) {
            doc.data.access = access
          }
          let keys = Object.keys(team.rtsps)
          doc.data.rtsps = omit(team.rtsps, pullAll(keys, map(channels, 'label')))
        }
      }
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async rtsps (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let { channel, rtsps } = req.body
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    if (!validator.isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let auth = req.user as ResponseUserDocument
    let doc: UpdateDocument<EditTeamDocument> = {
      conditions: { _id },
      data: {
        rtsps: {}
      }
    }
    let TeamProxy = teamProxy(errorState)
    try {
      filterUserLevel(auth, 0, 9000, ErrorInfo)
      let team = await TeamProxy.Dao.findOne(doc.conditions) as ResponseTeamDocument
      doc.data.rtsps = { ...oc(team).rtsps({}), [channel]: parseValue(rtsps, String) }
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }

  }

  public async setPeoples (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let { peoples } = req.body
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    if (!validator.isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let auth = req.user as ResponseUserDocument
    try {
      filterUserLevel(auth, 0, 9000, ErrorInfo)
      return next({ _id, peoples: getPeoples(peoples) })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

}

export default new TeamFilter()

function getPeoples (peoples: string | string[]): string[] {
  if (!Array.isArray(peoples)) return [ peoples ]
  let _peoples: string[] = []
  for (let people of peoples) {
    if (validator.isMongoId(people)) {
      _peoples.push(people)
    }
  }
  return _peoples
}

function parseValue (value: any, format: (val: any) => any): any {
  if (Array.isArray(value)) {
    return value.map(format)
  }
  if (isString(value) && /(\,)/.test(value)) {
    return value.split(',').map(format)
  }
  return format(value)
}