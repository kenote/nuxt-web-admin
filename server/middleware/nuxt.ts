import { Response, NextFunction } from 'express'
import { NuxtTypes } from '@/types/restful'
import { Channel } from '@/types/channel'
import * as channels from '~/channel.json'

type Request = NuxtTypes.request

export async function nuxtHandler (req: Request, res: Response, next: NextFunction): Promise<void> {
  let isNuxtPage: boolean = !/^(\/\_nuxt|\/__webpack_hmr)|(\.ico|\.png)$/.test(req.path)
  if (isNuxtPage) {
    // ...
    req.__name = 'Nuxt Server'
    req.__channels = channels as Channel.element[]
  }
  return next()
}