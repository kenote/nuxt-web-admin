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
import * as yaml from 'js-yaml'
import { map, compact, orderBy } from 'lodash'

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

}

export = ProtoController