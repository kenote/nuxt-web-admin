import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { loadError } from '~/utils/error'
import __ErrorCode from '~/utils/error/code'
import { language } from '~/config'
import { ResponseUserDocument } from '@/types/proxys/user'
import { oc } from 'ts-optchain'
import { Filter, asyncFilterData } from 'kenote-validate-helper'
import { isYaml, formatArray } from '@/utils'
import { filterUserLevel, permissionFilter } from '~/middleware/auth'
import { UpdateSettingDocument } from '@/types/proto'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { ProtoOptions, ProtoAPI, ProtoSend } from '@/types/proto'
import { isEmpty, isString, map } from 'lodash'
import { Maps } from 'kenote-config-helper'
import { isDateString } from '@/utils/query'
import * as dayjs from 'dayjs'
import ditchProxy from '~/proxys/ditch'
import { toPageInfo } from '~/utils'
import userProxy from '~/proxys/user'
import { QueryDocument } from '@/types/proxys'
import { QueryOptions } from 'kenote-mongoose-helper'
import validator from 'validator'

class ProtoFilter {

  public async updateSetting (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel, tag } = req.params
    let { content } = req.body
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    let auth = req.user as ResponseUserDocument
    let filters = [
      {
        key     : 'content',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_NAME_REQUIRED, ['内容'], true) },
          { validator: isYaml, ...ErrorInfo(__ErrorCode.ERROR_VALID_NAME_FORMAT, ['内容', 'Yaml'], true)}
        ],
        value   : content
      }
    ] as Filter[]
    try {
      filterUserLevel(auth, 0, 9000, ErrorInfo)
      let document = await asyncFilterData(filters) as UpdateSettingDocument
      document.file = `projects/${channel}/${tag}.yml`
      return next(document)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async send (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel, tag } = req.params
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    let auth = req.user as ResponseUserDocument
    let DitchProxy = ditchProxy(errorState)
    try {
      permissionFilter(req.path, 'access', auth, ErrorInfo)
      let setting = loadData(`projects/${channel}/setting`) as ProtoOptions
      if (isEmpty(setting)) {
        return res.api(null, __ErrorCode.ERROR_NOT_FOUND_CHANNEL)
      }
      let apis = loadData(`projects/${channel}/api`) as Maps<ProtoAPI>
      if (isEmpty(apis) || !Object.keys(apis).includes(tag)) {
        return res.api(null, __ErrorCode.ERROR_NOT_FOUND_API)
      }
      let { autoFields, request, alias, proto, parse, ditchOptions, parameter } = apis[tag]
      if (oc(setting).release()) {
        let rstp = oc(setting).release[tag]()
        proto.rstp = rstp
      }
      request['ss'] = 'array'
      let payload = formatPayload(req.body, request, alias)
      if (autoFields) {
        for (let field in autoFields) {
          let { reference, subtract, add } = autoFields[field]
          let fieldValue: number = payload[reference]
          if (subtract) {
            let [ value, unit ] = subtract
            payload[field] = dayjs(fieldValue).subtract(Number(value), unit as dayjs.UnitType).toDate().getTime()
          }
          else if (add) {
            let [ value, unit ] = add
            payload[field] = dayjs(fieldValue).add(Number(value), unit as dayjs.UnitType).toDate().getTime()
          }
        }
      }
      if (ditchOptions) {
        let [ item, key ] = ditchOptions
        let label: string = oc(payload)[item]('')
        if (label) {
          let ditchs = await DitchProxy.Dao.find({ channel, label: { $in: label.split(/\,/) } })
          if (ditchs) {
            payload[item] = map(ditchs, key || 'name').join(',')
          }
        }
      }
      let rtsp_key = oc(req).headers.rtsp_key('Slave') as string
      payload = { ...payload, ...parameter }
      let document: ProtoSend.document = {
        setting,
        payload,
        proto,
        parse,
        rtsp_key
      }
      return next(document)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async logs (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel } = req.params
    let { create_at, user, sort } = req.body
    let { limit, skip } = toPageInfo(req.body.page, req.body.size || 15)
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    let auth = req.user as ResponseUserDocument
    let conditions: any = { channel }
    if (Array.isArray(create_at)) {
      let [ begin, end ] = create_at
      if (begin && end) {
        conditions = { ...conditions, create_at: { $gte: begin, $lt: end } }
      }
    }
    let UserProxy = userProxy(errorState)
    try {
      filterUserLevel(auth, 0, 9000, ErrorInfo)
      if (user) {
        let users = await UserProxy.Dao.find({ 
          $or: [
            { username  : RegExp(`${user}`) },
            { email     : RegExp(`${user}`) },
            { mobile    : RegExp(`${user}`) }
          ]
        }) as ResponseUserDocument[]
        conditions = { ...conditions, user: { $in: users.map( u => u._id ) } }
      }
      let findProto: QueryDocument<QueryOptions> = {
        conditions,
        options: {
          limit,
          skip,
          sort: { _id: -1, create_at: -1 }
        }
      }
      let [ prop, order ] = oc(Array.isArray(sort) ? sort : [ sort ])([])
      if (order) {
        findProto.options.sort = { [prop]: /^(desc)/.test(order) ? -1 : 0 }
      }
      return next(findProto)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async removelogs (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
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
      filterUserLevel(auth, 0, 9000, ErrorInfo)
      return next(conditions)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export default new ProtoFilter()

/**
 * 格式化提交参数
 * @param body any
 * @param request ProtoSend.request
 * @param alias Maps<ProtoSend.alias[]>
 */
function formatPayload (body: any, request: ProtoSend.request, alias?: Maps<ProtoSend.alias[]>): Maps<any> {
  let payload: Maps<any> = {}
  for (let key in request) {
    let value = oc(body)[key]()
    if (value) {
      let requestKey = oc(request)[key]()
      if (requestKey === 'date') {
        value = isDateString(value) ? new Date(value).getTime() : Date.now()
        if (key === 'end') {
          value += 24 * 3600 * 1000 - 1000
        }
      }
      else if (requestKey === 'array') {
        if (isString(value)) {
          value = value.split(',')
        }
      }
      else if (requestKey === 'string') {
        value = [ ...new Set(formatArray(value, 'string')) ].join(',')
        let aliasKey = oc(alias)[key]()
        if (aliasKey) {
          let Palias = aliasKey.find( o => o.key === value )
          if (Palias) {
            value = Palias.value
          }
        }
        // value = value.replace(/^(0)$/, '')
      }
      else if (requestKey === 'number') {
        value = Number(value)
      }
      payload[key] = value
    }
  }
  return payload
}