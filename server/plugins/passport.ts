import koaPassport from '@kenote/koa-passport'
import passport from 'koa-passport'
import { Context } from '@kenote/koa'
import { strategyJwt } from '~/middlewares/auth'

// Add Strategy
passport.use(strategyJwt)

/**
 * JWT 认证
 * @param ctx 
 * @param next 
 */
export const authenticate = [
  (ctx: Context, next) => passport.authenticate('jwt', { session: false })(ctx.context, next),
  (ctx: Context, next) => {
    Context.prototype.user = ctx.context.state?.user
    return next()
  }
]

export default koaPassport()