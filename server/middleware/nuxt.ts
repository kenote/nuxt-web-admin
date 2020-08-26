import { Response, NextFunction } from 'express'
import { NuxtTypes, Register, SinglePage, PageFlag, DashboardOptions } from '@/types/restful'
import { Channel } from '@/types/channel'
import { site_url, options } from '~/config'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { Maps } from 'kenote-config-helper'
import { getRtsps } from '~/utils'
import { oc } from 'ts-optchain'

type Request = NuxtTypes.request

export async function nuxtHandler (req: Request, res: Response, next: NextFunction): Promise<void> {
  let isNuxtPage: boolean = !/^(\/\_nuxt|\/__webpack_hmr)|(\.ico|\.png)$/.test(req.path)
  if (isNuxtPage) {
    // ...
    req.__name = oc(options).title()
    req.__channels = loadData('config/channels', 'array') as Channel.element[]
    req.__flags = loadData('config/flags') as Maps<PageFlag.item>

    req.__proxyhost = site_url!
    req.__register = loadData('config/register') as Register.config
    req.__singlePages = loadData('config/singlepages', 'array') as SinglePage.item[]
    req.__dashboard = loadData('config/dashboard') as DashboardOptions
    req.__rtsps = getRtsps()

    req.__metas = oc(options).metas()
  }
  return next()
}