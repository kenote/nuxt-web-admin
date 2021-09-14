import axios from 'axios'
import { HttpClient, HeaderOptions } from '@kenote/common'
import { HttpClientOptions } from '@/types/client'

export const httpClient = (options?: HttpClientOptions) => new HttpClient(axios, options)

export function getHeaders<T extends HeaderOptions> (options?: T) {
  let headers = options?.headers ?? {}
  if (options?.token) {
    headers.authorization = ['Bearer', options.token].join(' ')
  }
  return headers
}