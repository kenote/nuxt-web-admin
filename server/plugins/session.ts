import session from '@kenote/koa-session'
import redisStore from 'koa-redis'

export default session({
  store: redisStore({})
})