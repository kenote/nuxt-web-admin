import axios from 'axios'
import { HttpClient, HeaderOptions } from '@kenote/common'
import { HttpClientOptions } from '@/types/client'
import * as esprima from 'esprima'
import escodegen from 'escodegen'

export const httpClient = (options?: HttpClientOptions) => new HttpClient(axios, options)

export function getHeaders<T extends HeaderOptions> (options?: T) {
  let headers = options?.headers ?? {}
  if (options?.token) {
    headers.authorization = ['Bearer', options.token].join(' ')
  }
  return headers
}

/**
 * 通过URL异步获取代码
 * @param url 
 */
export async function getEscode (url: string) {
  try {
    let result = await httpClient().GET<string>(url)
    let escode = readEscode(result ?? '') 
    return escode
  } catch (error) {
    return undefined
  }
}

/**
 * 将字符串解析为代码
 * @param code 
 */
export function readEscode (source: string) {
  let ast = esprima.parseModule(source)
  let result = escodegen.generate(ast)
  // tslint:disable-next-line: no-eval
  return eval(result)
}