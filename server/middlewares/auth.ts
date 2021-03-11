import { Strategy, StrategyOptions, ExtractJwt, VerifyCallbackWithRequest } from 'passport-jwt'
import jwt from 'jsonwebtoken'
import { loadConfig } from '@kenote/config'
import { ServerConfigure } from '@/types/config'
import * as service from '~/services'

const { secretKey } = loadConfig<ServerConfigure>('config/server', { mode: 'merge' })

/**
 * JWT Payload 类型；用于存储用户标记
 */
export declare interface Jwtpayload {
  /**
   * 用户标记
   */
  _id        : string
}

/**
 * JWT 选项
 */
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  passReqToCallback: true,
  secretOrKey: secretKey ?? 'kenote'
}

/**
 * 验证 JWT 策略
 * @param req 
 * @param payload 
 * @param done 
 */
const strategyVerify: VerifyCallbackWithRequest = async (req, payload: Jwtpayload, done) => {
  let jwToken = req.headers.authorization?.replace(/^(Bearer)\s{1}/, '')
  try {
    // 认证 Token
    let user = await service.db.user.Dao.findOne({ _id: payload._id, jw_token: jwToken })
    if (!user) {
      return done(null, false)
    }
    return done(null, user)
  } catch (error) {
    return done(error, false)
  }
  
}

/**
 * 定义 JWT 策略
 */
export const strategyJwt = new Strategy(jwtOptions, strategyVerify)


/**
 * 设置 JWT Token
 * @param payload 
 * @param options 
 */
export const setJwToken = (payload: Jwtpayload, options?: jwt.SignOptions) => jwt.sign(payload, jwtOptions.secretOrKey as jwt.Secret, options)


/**
 * 验证 JWT Token
 * @param token 
 * @param options 
 * @returns 
 */
export const verifyJwToken = (token: string, options?: jwt.VerifyOptions) => jwt.verify(token, jwtOptions.secretOrKey as jwt.Secret, options) as Jwtpayload
