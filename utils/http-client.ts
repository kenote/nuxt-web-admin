import axios, { AxiosRequestConfig } from 'axios'
import { HttpClient, HeaderOptions } from '@kenote/common'

export const httpClient = (options?: HttpClientOptions) => new HttpClient(axios, options)

export type HttpClientOptions = HeaderOptions<AxiosRequestConfig>

export interface HttpResult<T = any> {
  data   ?: T
  error  ?: string
}
