import * as passport from 'passport'
import * as passportJWT from 'passport-jwt'
import * as jwt from 'jsonwebtoken'
import { Request } from 'express'
import { oc } from 'ts-optchain'
import { pick } from 'lodash'
import { session_secret, language } from '~/config'
import userProxy, { userBaseField } from '~/proxys/user'
import { loadError } from '~/utils/error'

interface Payload {

  /**
   * 登录用户 _id
   */
  _id          : string
}

const jwtOptions: passportJWT.StrategyOptions = {
  jwtFromRequest            : passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  passReqToCallback         : true,
  secretOrKey               : session_secret
}

const strategyVerify = async (req: Request, payload: Payload, done: passportJWT.VerifiedCallback) => {
  let jwToken = oc(req).headers.authorization('').replace(/^(Bearer)\s{1}/, '')
  let lang = oc(req).query.lang('') as string || language
  let errorState = loadError(lang)
  try {
    let user = await userProxy(errorState).Dao.findOne({ _id: payload._id, jw_token: jwToken })
    if (!user) {
      req.logout()
      return done(null, false)
    }
    return done(null, pick(user, userBaseField))
  } catch (error) {
    return done(error, false)
  }
}

export const strategy = new passportJWT.Strategy(jwtOptions, strategyVerify)

export const setToken = (payload: Payload, options?: jwt.SignOptions) => jwt.sign(
  payload,
  jwtOptions.secretOrKey as jwt.Secret,
  options
)

export const authPayload = (token: string, options?: jwt.SignOptions) => jwt.verify(
  token, 
  jwtOptions.secretOrKey as jwt.Secret,
  options
) as Payload

export const authenticate = passport.authenticate('jwt', { session: false })
