import { Nuxt, Builder } from 'nuxt'
import nuxtConfig from '@/nuxt.config'
import { IModule } from '@kenote/core'
import { toRequestHandler } from '@kenote/koa'
import { NuxtPayload } from '@/types/nuxtServer'
import { loadConfig } from '@kenote/config'
import { ServerConfigure } from '@/types/config'
import { merge } from 'lodash'
import { NavMenu, Channel, EditorConfig } from '@/types/client'

const { metaInfo: head, host, port } = loadConfig<ServerConfigure>('config/server', { mode: 'merge' })
const dev = process.env.NODE_ENV !== 'production'
const nuxt: Nuxt = new Nuxt(merge(nuxtConfig, { dev }))

async function nuxtReady () {
  await nuxt.ready()
  if (process.env.NODE_ENV === 'development') {
    let builder = new Builder(nuxt)
    await builder.build()
  }
}

const nuxtPulgin: IModule.ssrPlugin = {
  prefix: '/',
  handler: [
    toRequestHandler((ctx, next) => {
      let isNuxtPage = !/^(\/\_nuxt|\/__webpack_hmr)|(\.ico|\.png)$/.test(ctx.path)
      if (isNuxtPage) {
        ctx.payload = {
          site_url: 'http://localhost:4000',
          baseHost: `http://${host ?? '0.0.0.0'}:${port}`,
          dashboard: loadConfig<NavMenu.Configure>('config/dashboard', { mode: 'merge' }),
          channels: loadConfig<Channel.DataNode[]>('config/channels', { type: 'array' }),
          editorConfig: loadConfig<EditorConfig>('config/editor', { mode: 'merge' }),
          metaInfo: head
        } as NuxtPayload
      }
      return next()
    }),
    
    toRequestHandler(ctx => {
      ctx.status(200)
      ctx.context.respond = false
      ctx.req['$__payload'] = ctx.payload
      ctx.req.ctx = ctx.context
      nuxt.render(ctx.req, ctx.res)
    })
  ],
  prescript: nuxtReady
}
export default nuxtPulgin