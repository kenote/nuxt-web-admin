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
    try {
      let result = await new FileStore({ request: req, options }).asyncSave(storeErrorInfo) as ProxyResult[]
      if (result.length === 0) {
        return res.api(null, __ErrorCode.ERROR_UPLOAD_NOT_FILE)
      }
      return res.api(result)
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