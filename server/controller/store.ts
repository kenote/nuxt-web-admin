import * as path from 'path'
import { Controller, Router, Filter } from 'kenote-express-helper'
import { ProxyResult } from 'kenote-store-helper'
import { Request, Response, NextFunction } from 'express'
import { oc } from 'ts-optchain'
import { IResponse } from '~/middleware/restful'
import { FileStore, IStroeOptions } from '~/utils/store'
import { loadError } from '~/utils/error'
import { language } from '~/config'
import storeFilter from '~/filters/controller/store'
import { authenticate } from '~/middleware/auth'
import { ResponseUserDocument } from '@/types/proxys/user'
import * as urlParse from 'url-parse'
import * as qs from 'query-string'
import { unset } from 'lodash'

class StoreController extends Controller {

  @Router(
    { method: 'post', path: '/upload' },
    { method: 'post', path: '/upload/:type' }
  )
  @Filter( authenticate, storeFilter.setting, storeFilter.upload )
  public async upload (options: IStroeOptions, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let { __ErrorCode, ErrorInfo, CustomError } = loadError(lang)
    let storeErrorInfo = (code: number, opts?: any) => ErrorInfo(code, opts, true)
    let user = req.user as ResponseUserDocument
    try {
      let result = await new FileStore({ request: req, options }).asyncSave(storeErrorInfo) as ProxyResult[]
      if (result.length === 0) {
        return res.api(null, __ErrorCode.ERROR_UPLOAD_NOT_FILE)
      }
      return res.api(result.map( data => parseUserDir(data, options.user_dir ? user : null) ))
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  @Router(
    { method: 'get', path: '/download/:filename' },
    { method: 'get', path: '/download/:type/:filename' }
  )
  @Filter( storeFilter.setting, storeFilter.download )
  public async download (options: IStroeOptions, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let { CustomError } = loadError(lang)
    let { root_dir } = options
    let { filename } = req.params
    let { sub_dir, download } = req.query as unknown as { sub_dir: string, download: boolean }
    let rootDir: string = path.resolve(process.cwd(), root_dir!)
    try {
      let filePath: string = path.resolve(rootDir, oc(sub_dir)('').replace(/^\//, ''), oc(filename)('').replace(/^\//, ''))
      return res.downloadFile(filePath, { download })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export = StoreController

/**
 * 处理用户目录
 */
function parseUserDir (data: ProxyResult, user: ResponseUserDocument | null): ProxyResult {
  unset(data, 'path')
  if (!user)  return data
  let { url } = data
  let { origin, pathname } = urlParse(url)
  let query = urlParse(url).query as unknown as string || ''
  let { sub_dir } = qs.parse(query)
  let sub_dir_arr = [ String(user._id) ]
  if (sub_dir) {
    sub_dir_arr.push(sub_dir as string)
  }
  let payload = { sub_dir: sub_dir_arr.join('/') }
  data.url = `${origin}${pathname}?${qs.stringify(payload)}`
  return data
}