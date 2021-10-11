import { Method } from '@kenote/common'
import { compact, merge, get, last } from 'lodash'
import { IncomingHttpHeaders } from 'http'
import qs from 'query-string'
import runscript from 'runscript'
import { HttpRequest, HttpResponse } from '@/types/services/http'
import validator from 'validator'

export async function shellAsCurl (request: HttpRequest) {
  let shell = fetchToShell(request)
  let result = await runscript(`${shell} -i`, { stdio: 'pipe' })
  let [ tunnel, status, ...info ] = compact(result.stdout?.toString()?.split(/\r\n/))
  let headers = info.slice(0, info.length -1)
  let data = last(info) ?? ''
  let response: HttpResponse = {
    body: validator.isJSON(data) ? JSON.parse(data) : data,
    headers,
    status
  }
  return response
}

export function fetchToShell (request: HttpRequest) {
  let { method, params, body, headers } = request
  let shell = 'curl'
  let Imethod = toMethodShell(method)
  let { url, query } = qs.parseUrl(request.url)
  let Iurl = qs.stringifyUrl({ url, query: merge(query, params) })
  let data = ''
  if (body && (method ?? 'GET').toLowerCase() != 'get') {
    let contentType = Object.keys(headers ?? {}).find( r => r.toLowerCase() === 'content-type' )
    if (get(headers, contentType!) === 'application/json') {
      data = `-d '${JSON.stringify(body)}'`
    }
    else {
      data = `-d '${qs.stringify(body)}'`
    }
  }
  let Iheaders = toHeaderShell(headers)
  return compact([ shell, data, Imethod, Iurl, Iheaders ]).join(' ')
}

/**
 * 转换 Method
 * @param value 
 */
function toMethodShell (value: Method) {
  let method = value.toUpperCase()
  return method === 'GET' ? '' : `-X ${method}`
}

/**
 * 转换 Headers
 * @param value 
 */
function toHeaderShell (value?: IncomingHttpHeaders) {
  if (!value) return ''
  let shell: string[] = []
  for (let [key, val] of Object.entries(value)) {
    shell.push(`-H "${key}: ${val}"`)
  }
  return shell.join(' ')
}