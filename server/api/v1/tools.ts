import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { language, site_url } from '~/config'
import { oc } from 'ts-optchain'
import { loadError } from '~/utils/error'
import { Qqwry } from '~/utils/qqwry'
import toolsFilter from '~/filters/api_v1/tools'
import { IPInfoResponse, IPInfo } from '@/types/qqwry'
import * as dns from 'dns'
import validator from 'validator'
import { Channel } from '@/types/channel'
import httpClient, { HeaderOptions, HttpResponse } from '@/utils/http'
import * as runscript from 'runscript'
import { fetchToShell, collectionToQuery, getUrlAddress } from '@/utils'
import { KeyMap } from 'kenote-config-helper'
import { compact, Dictionary } from 'lodash'
import * as qs from 'query-string'

@Path('/tools')
class ToolsController extends Controller {

  @Router({ method: 'get', path: '/ip' })
  @Filter( toolsFilter.ip )
  public async ip (ips: string[], req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let lang = oc(req).query.lang('') as string || language
    let { CustomError } = loadError(lang)
    try {
      let { name, version } = Qqwry
      let info: IPInfo[] = []
      for( let ip of ips) {
        if (validator.isFQDN(ip)) {
          let dips = await dns.promises.resolve4(ip)
          for (let item of dips) {
            info.push(Qqwry.searchIP(item))
          }
        }
        else {
          info.push(Qqwry.searchIP(ip))
        }
      }
      let data: IPInfoResponse = { name, version, info }
      return res.api(data)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  @Router({ method: 'post', path: '/http' })
  @Filter( toolsFilter.http )
  public async http (fetch: Channel.api, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { method, url, params } = fetch
    let lang = oc(req).query.lang('') as string || language
    let { CustomError } = loadError(lang)
    let _url = getUrlAddress(url, site_url)
    try {
      let result: HttpResponse = {}
      let shell = fetchToShell(fetch, site_url)
      let output = await runscript(shell + ' -I', { stdio: 'pipe' })
      let headers =  parseShellHeaders(output.stdout?.toString() || '')
      let contentType = headers['Content-Type'] || headers['content-type']
      if (/(text|json|javascript)/.test(contentType)) {
        let options = oc(fetch).options({}) as HeaderOptions
        options.done = response => {
          let { headers, data } = response
          result = { headers, data }
        }
        await httpClient.sendData(method, _url, params, options)
        if (!result.data) {
          let shell = fetchToShell(fetch, site_url)
          let body = await runscript(shell, { stdio: 'pipe' })
          result.data = body.stdout?.toString()
          if (headers) {
            result.headers = headers
          }
        }
        return res.api(result)
      }
      else {
        result.headers = headers
        return res.api(result)
      }
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export = ToolsController

function parseShellHeaders (value: string): Dictionary<any> {
  let values = value.split('\r\n')
  let collection: Array<KeyMap<string> | ''> = values.map( item => {
    if (/^(HTTP)/.test(item)) {
      return ''
    }
    let [ key, name ] = item.split(': ')
    return { key, name }
  })
  return qs.parse(collectionToQuery(compact(collection)))
}