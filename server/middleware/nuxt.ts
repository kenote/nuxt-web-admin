import { Response, NextFunction } from 'express'
import { NuxtTypes, Register, SinglePage } from '@/types/restful'
import { Channel } from '@/types/channel'
import * as channels from '~/channel.json'
import { site_url } from '~/config'
import { loadData } from 'kenote-config-helper/dist/utils.server'

type Request = NuxtTypes.request

export async function nuxtHandler (req: Request, res: Response, next: NextFunction): Promise<void> {
  let isNuxtPage: boolean = !/^(\/\_nuxt|\/__webpack_hmr)|(\.ico|\.png)$/.test(req.path)
  if (isNuxtPage) {
    // ...
    req.__name = 'Nuxt Server'
    req.__channels = channels as Channel.element[]

    req.__proxyhost = site_url!
    req.__register = loadData('config/register') as Register.config
    req.__singlePages = loadData('config/singlepages', 'array') as SinglePage.item[]
  }
  return next()
}