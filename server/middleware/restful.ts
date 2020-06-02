import * as path from 'path'
import * as fs from 'fs-extra'
import * as nunjucks from 'nunjucks'
import { isNumber, isError } from 'util'
import { Response, Request } from 'express'
import { IError, IErrorInfo } from 'kenote-config-helper'
import { Middleware, MiddlewareSetting, RegisterMiddlewareMethod } from 'kenote-express-helper'
import { oc } from 'ts-optchain'
import { language, options } from '~/config'
import { loadError } from '~/utils/error'
import logger from '~/utils/logger'
import { previewFile } from '~/utils/store'

type APIResponseHandler = (data: any, error?: number | IError | IErrorInfo, opts?: string[]) => Response

// tslint:disable-next-line: interface-name
export interface IResponse extends Response {
  
  /**
   * API 输出
   */
  api          : APIResponseHandler

  /**
   * 指定输出 404 Not Found
   */
  notfound     : () => void

  /**
   * 下载文件
   */
  downloadFile : (file: string, options?: DownloadOptions) => void
}

interface DownloadOptions {

  /**
   * 如果是网络图像之类的文件，是否直接下载
   */
  download    ?: boolean
}

@MiddlewareSetting({
  header: oc(options).headers([])
})
class Restful extends Middleware {

  @RegisterMiddlewareMethod()
  public api (res: Response, req: Request) {
    let lang = oc(req).query.lang('') as string || language
    let { __ErrorCode, ErrorInfo } = loadError(lang)
    return (data: any, error?: number | IError | IErrorInfo, opts?: string[]): Response => {
      let _error = error || __ErrorCode.ERROR_STATUS_NULL
      let errorCode = isNumber(_error) ? _error : _error.code!
      let status = (isNumber(_error) ? ErrorInfo(errorCode, opts, true) : _error) as IErrorInfo
      if (isError(_error)) {
        status = { code: _error.code!, message: _error.message }
      }
      let errorInfo = nunjucks.renderString(oc(options).errorInfo('{}'), status)
      let info = { data, ...JSON.parse(errorInfo) }
      logger.info(`Result API -->`, JSON.stringify({
        path: req.originalUrl,
        method: req.method,
        headers: req.headers,
        payload: req.body,
        response: info
      }, null, 2))
      return res.json(info)
    }
  }

  @RegisterMiddlewareMethod()
  public notfound (res: Response): any {
    return () => res.status(404).render('error', { message: 'This page could not be found' })
  }

  @RegisterMiddlewareMethod()
  public downloadFile (res: IResponse): any {
    return (filePath: string, options?: DownloadOptions): Response | void => {
      if (!fs.existsSync(filePath)) {
        return res.notfound()
      }
      let fileStream = fs.readFileSync(filePath)
      let extname = path.extname(filePath)
      let contentType = oc(options).download() ? undefined : previewFile[extname]
      res.setHeader('Content-Type', contentType || 'application/octet-stream')
      return res.send(fileStream)
    }
  }

}

export default new Restful().hendler()