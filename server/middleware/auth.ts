import * as passport from 'passport'
import * as passportJWT from 'passport-jwt'
import * as jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { oc } from 'ts-optchain'
import { pick, minBy } from 'lodash'
import { session_secret, language } from '~/config'
import userProxy, { userBaseField } from '~/proxys/user'
import { loadError } from '~/utils/error'
import * as PassportAPI from '@/types/apis/passport'
import { Maps } from 'kenote-config-helper'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { PageFlag } from '@/types/restful'
import { IResponse } from '~/middleware/restful'
import { ResponseUserDocument } from '@/types/proxys/user'
import __ErrorCode from '~/utils/error/code'
import { ErrorInfo } from '~/utils/error'
 
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

export const permission = (key: string, tag: PageFlag.type) => (req: Request, res: IResponse, next: NextFunction): void | Response => {
  let user = req.user as ResponseUserDocument
  if (!isFlag(user.group.level, key, tag)) {
    return res.api(null, tag === 'access' ? __ErrorCode.ERROR_AUTH_FLAG_ACCESS : __ErrorCode.ERROR_AUTH_FLAG_OPERATE)
  }
  return next()
}

export function filterUserLevel (auth: ResponseUserDocument, level: number, minLevel: number, ErrorInfo: ErrorInfo): void {
  let authLevel = auth.group.level
  if (authLevel === 9999) return
  if (authLevel < minLevel) {
    throw ErrorInfo(__ErrorCode.ERROR_ONLY_ADVANCED_ADMIN)
  }
  if (level >= authLevel) {
    throw ErrorInfo(__ErrorCode.ERROR_BYLOND_LEVEL_OPERATE)
  }
}

function isFlag (level: number, key: string, tag: PageFlag.type = 'access'): boolean {
  let flags = loadData('config/flags') as Maps<PageFlag.item>
  let flagLevel = oc(flags)[key][tag]()
  if (flagLevel) {
    return level >= flagLevel
  }
  return true
}
