import session from '@kenote/koa-session'
import redisStore from 'koa-redis'
import { loadConfig } from '@kenote/config'
import { ServerConfigure } from '@/types/config'

const { redisOpts } = loadConfig<ServerConfigure>('config/server', { mode: 'merge' })

export default session({
  store: redisStore({ ...redisOpts })
})