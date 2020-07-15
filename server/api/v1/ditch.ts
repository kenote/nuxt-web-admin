import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { language } from '~/config'
import { oc } from 'ts-optchain'
import { loadError } from '~/utils/error'
import ditchFilter from '~/filters/api_v1/ditch'
import { authenticate, permission } from '~/middleware/auth'
import ditchProxy from '~/proxys/ditch'
import { UpdateDithsDocument } from '@/types/proxys/ditch'
import * as yaml from 'js-yaml'
import { Maps } from 'kenote-config-helper'
import { omit, clone, map } from 'lodash'

class DitchController extends Controller {

  /**
   * 获取渠道列表
   */
  @Router({ method: 'get', path: '/ditch/:channel' })
  @Filter( authenticate, ditchFilter.getlist )
  public async getlist (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let DitchProxy = ditchProxy(errorState)
    try {
      let ditchs = await DitchProxy.Dao.find(conditions, { sort: { label: 1 } })
      return res.api(ditchs)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 更新渠道
   */
  @Router({ method: 'post', path: '/ditch/:channel/update' })
  @Filter( authenticate, permission('/setting/project/ditch', 'edit'), ditchFilter.update )
  public async update (document: UpdateDithsDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel, content } = document
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { CustomError } = errorState
    let DitchProxy = ditchProxy(errorState)
    let data = yaml.load(content) as Array<Maps<any>>
    data = data.map( o => ({ ...omit(o, ['key']), label: o.key, cardinal_number: oc(o).cardinal_number({}) }))
    try {
      for (let item of data) {
        let { label } = item
        let doc = JSON.parse(JSON.stringify(item))
        let ditch = await DitchProxy.Dao.findOne({ label, channel })
        if (ditch) {
          await DitchProxy.Dao.updateOne({ _id: ditch._id }, { $set: doc })
        }
        else {
          await DitchProxy.Dao.insert({ ...doc, channel })
        }
      }
      await DitchProxy.Dao.remove({ channel, label: { $nin: map(data, 'label') }})
      return res.api(null)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export = DitchController