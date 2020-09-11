import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { language } from '~/config'
import { oc } from 'ts-optchain'
import { loadError } from '~/utils/error'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { authenticate, permission } from '~/middleware/auth'
import { UpdateSettingDocument } from '@/types/proto'
import protoFilter from '~/filters/api_v1/proto'
import * as fs from 'fs-extra'
import * as path from 'path'
import { map, compact, orderBy, zipObject, get, set, Dictionary, isString, unset } from 'lodash'
import { ProtoSend } from '@/types/proto'
import ProtoUtil, { protoUtils } from '~/utils/proto'
import logger from '~/utils/logger'
import { Maps } from 'kenote-config-helper'
import protoProxy from '~/proxys/proto'
import { QueryDocument } from '@/types/proxys'
import { QueryOptions, ListData } from 'kenote-mongoose-helper'
import { maxPageno } from '@/utils'
import httpClient from '@/utils/http'
import * as nunjucks from 'nunjucks'

@Path('/proto')
class ProtoController extends Controller {

  /**
   * 获取项目的配置表
   */
  @Router({ method: 'get', path: '/:channel/setting/:tag'})
  public async setting (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel, tag } = req.params
    let { t } = req.query
    let result = loadData(`projects/${channel}/${tag}.yml`)
    let children = compact([...new Set(map(result, 'children'))])
    if (children.length > 0 && !t) {
      let _result: any[] = []
      for (let group of children) {
        let r = result.find( o => o.children === group )
        _result = [ ...group.map( o => ({ ...o, group: r?.key })) ]
      }
      result = orderBy(_result, ['key'], ['asc']) 
    }
    return res.api(result)
  }

  /**
   * 更新项目的配置表
   */
  @Router({ method: 'post', path: '/:channel/setting/:tag' })
  @Filter( authenticate, permission('/setting/project/goods', 'edit'), protoFilter.updateSetting )
  public async update_setting (document: UpdateSettingDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { file, content } = document
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let filePath = path.resolve(process.cwd(), file!)
    try {
      if (file) {
        await fs.writeFile(filePath, content, { encoding: 'utf-8' })
      }
      return res.api(null)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 日志查询
   */
  @Router({ method: 'post', path: '/:channel/logs' })
  @Filter( authenticate, protoFilter.logs )
  public async logs (document: QueryDocument<QueryOptions>, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, options } = document
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let ProtoProxy = protoProxy(errorState)
    try {
      let protoData = await ProtoProxy.Dao.list(conditions, options) as ListData
      let { counts, limit, data } = protoData
      if (counts as never > 0 && data.length === 0) {
        let maxpageno = maxPageno(counts as never, limit)
        options.skip = (maxpageno - 1) * limit
        protoData = await ProtoProxy.Dao.list(conditions, options) as ListData
      }
      return res.api(protoData)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 删除日志
   */
  @Router(
    { method: 'delete', path: '/:channel/logs/:_id' },
    { method: 'delete', path: '/:channel/logs' }
  )
  @Filter( authenticate, protoFilter.removelogs )
  public async removelogs (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let ProtoProxy = protoProxy(errorState)
    try {
      let result = await ProtoProxy.Dao.remove(conditions)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  
  }

  /**
   * Proto 公用接口
   */
  @Router({ method: 'post', path: '/:channel/:tag' })
  @Filter( authenticate, protoFilter.send )
  public async send (document: ProtoSend.document, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel } = req.params
    let { setting, proto, payload, rtsp_key, parse } = document
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    try {
      let data: Maps<any> = {}
      if ('code' in proto) {
        let result = await new ProtoUtil(setting).send(proto, payload, rtsp_key, requestLog)
        if (!oc(result).msgbody()) {
          return res.api(null)
        }
        data = result.msgbody!
      }
      else if ('url' in proto) {
        let { method, url, params, options } = proto
        let _url = nunjucks.renderString(url, payload)
        let _payload = { ...params, ...payload }
        oc(url.match(/(\{){2}([a-zA-Z0-9\_\-]+)(\}){2}/g))([]).forEach( s => unset(_payload, s.replace(/(\{|\})/g, '')) )
        let restful = await httpClient.sendData(method, _url, _payload, options)
        data = isString(restful) ? { data: restful } : restful
      }
      let parserData = parseResultData(data, parse, channel)
      return res.api(parserData)
    } catch (error) {
      let err = error as Error
      let errstack = oc(err).stack(err.toString())
      if (CustomError(error)) {
        return res.api(null, error)
      }
      if (/(range|offset)/.test(error.message)) {
        return res.api({ data: {} })
      }
      return next(error)
    }
  }
}

export = ProtoController

function requestLog (info: ProtoSend.requestDocument): void {
  logger.info(``, JSON.stringify(info, null, 2))
}

/**
 * 解析返回数据
 * @param msgbody Maps<any>
 * @param parse ProtoSend.Parse[]
 */
function parseResultData (msgbody: Maps<any>, parse?: ProtoSend.parse[], channel?: string) {
  if (!parse) return msgbody
  let result: Maps<any> = {}
  for (let item of parse) {
    let { key, collection, separator, int, setBy, afterTrans, addedValue, filter, fields } = item
    let data = oc(msgbody)[key]()
    if (Array.isArray(data)) {
      let arrayData: Dictionary<any> = []
      if (filter) {
        data = data.map( o => String(o).split(separator).filter( (o, i) => oc(filter)([]).includes(i) ).join(separator as string) )
      }
      if (item.format) {
        data = protoUtils(item.format, [ data[0], separator, fields ])
      }
      if (collection) {
        for (let velues of data) {
          let value = zipObject(map(collection, 'key'), String(velues).split(separator).map(parseValue))
          if (addedValue) {
            let addedvalue = getAddedValue(value, addedValue, channel)
            value = { ...value, ...addedvalue }
          }
          if (int && value[int.key]) {
            value.int = protoUtils(int.function, [ value[int.key], ...int.options ])
          }
          arrayData.push(value)
        }
        if (item.orderBy) {
          let { iteratees, orders } = item.orderBy
          arrayData = orderBy(arrayData, iteratees, orders)
        }
        if (afterTrans) {
          let [ funcname, param ] = afterTrans
          arrayData = protoUtils(funcname as string, [ arrayData, param ])
        }
      }
      data = arrayData
    }
    if (setBy) {
      set(result, setBy, data)
    }
    else {
      result[key] = data
    }
  }
  return result
}

function parseValue (value: string) {
  if (/(^\{)|(\}$)/.test(value)) {
    // tslint:disable-next-line: no-eval
    return eval('(' + value + ')')
  }
  return value
}

function getAddedValue (data: Maps<any>, options: ProtoSend.addedValue[], channel?: string): Maps<any> {
  let value: Maps<any> = {}
  for (let item of options) {
    let { key, defaultValue } = item
    let { type, param, formula } = oc(item).options({ type: '', param: [] })
    let __value = defaultValue
    if (type) {
      let tables = loadData(`projects/${channel}/${type}.yml`) as Array<Maps<any>>
      let table = tables.find( o => o['key'] === data[param[0]] ) || {}
      if (formula) {
        let val = { data, table }
        let opts = oc(formula).opts([]).map( v => get(val, v, 0) )
        __value = oc(formula).func(() => defaultValue)(...opts)
      }
      else {
        __value = oc(table)[param[1]](defaultValue)
      }
    }
    value[key] = __value
  }
  return value
}