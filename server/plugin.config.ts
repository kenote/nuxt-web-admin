
import * as redis from 'redis'
import * as session from 'express-session'
import * as connectRedis from 'connect-redis'
import * as errorhandler from 'errorhandler'
import { RequestHandler, Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { redis as redisOpts } from '~/config'

const RedisStore = connectRedis(session)

export function sessionParser (secret: string | string[]): RequestHandler {
  let redisClient = redis.createClient(redisOpts)
  return session({
    secret: secret || '',
    store: new RedisStore({ client: redisClient }),
    resave: true,
    saveUninitialized: true
  })
}

export function notFoundHandler (req: Request, res: Response): void {
  return res.status(404).render('error', { message: 'This page could not be found.' })
}

export function errorHandler (): ErrorRequestHandler {
  if (process.env.NODE_ENV === 'development') {
    return errorhandler()
  }
  else {
    return (err: Error, req: Request, res: Response, next: NextFunction): void => {
      return res.status(500).render('error', { message: 'This page could internal server error' })
    }
  }
}