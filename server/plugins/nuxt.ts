import { Nuxt, Builder } from 'nuxt'
import nuxtConfig from '@/nuxt.config'
import { IModule } from '@kenote/core'
import { toRequestHandler } from '@kenote/koa'
import { NuxtPayload, AuthInfo } from '@/types/nuxtServer'
import { loadConfig } from '@kenote/config'
import { ServerConfigure, AccountConfigure } from '@/types/config'
import { merge } from 'lodash'
import { NavMenu, Channel, EditorConfig } from '@/types/client'
import { verifyJwToken, toUser } from '~/middlewares/auth'
import { db } from '~/services'

const { metaInfo: head, host, port, siteUrl } = loadConfig<ServerConfigure>('config/server', { mode: 'merge' })
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
        // let websocket = siteUrl?.replace(/^(http)/, 'ws')?.replace(/^(https)/, 'wss')
        ctx.payload = {
          site_url: siteUrl,
          baseHost: `http://127.0.0.1:${port}`,
          dashboard: loadConfig<NavMenu.Configure>('config/dashboard', { mode: 'merge' }),
          channels: loadConfig<Channel.DataNode[]>('config/channels', { type: 'array' }),
          editorConfig: loadConfig<EditorConfig>('config/editor', { mode: 'merge' }),
          account: loadConfig<AccountConfigure>('config/account', { mode: 'merge' }),
          metaInfo: head,
          getAuthInfo: async (token: string) => {
            let payload = verifyJwToken(token)
            if (payload) {
              let authInfo: AuthInfo = {}
              let user = await db.user.Dao.findOne({ _id: payload._id, jw_token: token })
              authInfo.user = user ? toUser(user) : user
              return authInfo
            }
            return null
          }
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