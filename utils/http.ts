import axios, { CancelToken, AxiosRequestConfig, AxiosResponse } from 'axios'
import { Maps } from 'kenote-config-helper'
import { RestfulInfoByError } from '@/types/restful'
import { oc } from 'ts-optchain'

export interface HeaderOptions {
  token         ?: string
  header        ?: object
  upload        ?: (percentage: number) => void
  download      ?: (percentage: number) => void
  entry         ?: string
  cancelToken   ?: CancelToken
  total         ?: number
}

/**
 * 获取返回数据
 * @param options AxiosRequestConfig
 */
async function getResponseData (options: AxiosRequestConfig): Promise<any> {
  let response = await axios(options) as AxiosResponse<any>
  if (response.status >= 200 && response.status < 300) {
    return response.data || {}
  }
  console.log(response.statusText)
  throw new Error(response.statusText)
}

/**
 * 设置头部信息
 * @param options HeaderOptions
 */
function setHeaders (options: HeaderOptions): Maps<any> {
  let headers = { ...options.header } as Maps<any>
  if (options.token) {
    headers.Authorization = ['Bearer', options.token].join(' ')
  }
  return headers
}

/**
 * 
 * @param restful 
 */
export function formatRestful (restful: any): RestfulInfoByError {
  if (oc(restful).Status()) {
    let { code: error, message } = oc(restful).Status()
    restful = { ...restful, error, message }
  }
  return restful as RestfulInfoByError
}

/**
 * HTTP 请求类
 */
class HTTPClient {

  /**
   * GET 请求
   * @param url string
   * @param data Maps<any> | null
   * @param options HeaderOptions
   */
  public get = async (url: string, data: Maps<any> | null, options?: HeaderOptions) => await this.sendData('get', url, data, options)

  /**
   * POST 请求
   * @param url string
   * @param data Maps<any> | null
   * @param options HeaderOptions
   */
  public post = async (url: string, data: Maps<any> | null, options?: HeaderOptions) => await this.sendData('post', url, data, options)

  /**
   * PUT 请求
   * @param url string
   * @param data Maps<any> | null
   * @param options HeaderOptions
   */
  public put = async (url: string, data: Maps<any> | null, options?: HeaderOptions) => await this.sendData('put', url, data, options)

  /**
   * DELETE 请求
   * @param url string
   * @param data Maps<any> | null
   * @param options HeaderOptions
   */
  public delete = async (url: string, data: Maps<any> | null, options?: HeaderOptions) => await this.sendData('delete', url, data, options)

  /**
   * 上传文件
   * @param url string
   * @param data Maps<any> | null
   * @param options HeaderOptions
   */
  public upload = async (url: string, data: Maps<any> | null, options?: HeaderOptions) => await this.post(url, data, { upload: (percentage: number) => {}, ...options })

  /**
   * 下载文件
   * @param url string
   * @param data Maps<any> | null
   * @param options HeaderOptions
   */
  public download = async (url: string, data: Maps<any> | null, options?: HeaderOptions) => await this.get(url, data, { download: (percentage: number) => {}, ...options })

  /**
   * 请求数据
   * @param method 'get' | 'post' | 'put' | 'delete'
   * @param url string
   * @param data Maps<any> | null
   * @param options HeaderOptions
   */
  public async sendData (method: 'get' | 'post' | 'put' | 'delete', url: string, data: Maps<any> | null, options?: HeaderOptions): Promise<any> {
    let config: AxiosRequestConfig = {
      method,
      url,
      headers: setHeaders({ ...options }),
      [method === 'get' ? 'params' : 'data']: data
    }
    if (options && options.cancelToken) {
      config.cancelToken = options.cancelToken
    }
    if (options && options.upload) {
      config.method = 'post'
      config.headers['Content-Type'] = 'multipart/form-data'
      config.transformRequest = [
        function (data: any, headers: any): any {
          return data
        }
      ]
      config.onUploadProgress = function (progressEvent: any): void {
        let percentage: number = Math.round((progressEvent.loaded * 100) / progressEvent.total) || 0
        if (percentage <= 100) {
          options.upload && options.upload(percentage)
        }
      }
    }
    if (options && options.download) {
      config.method = 'get'
      config.responseType = 'blob'
      config.onDownloadProgress = function (progressEvent: any): void {
        let percentage: number = Math.round((progressEvent.loaded * 100) / options.total!) || 0
        if (percentage <= 100) {
          options.download && options.download(percentage)
        }
      }
    }
    return getResponseData(config)
  }
}

export default new HTTPClient()