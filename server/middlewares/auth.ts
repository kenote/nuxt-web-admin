import { Strategy, StrategyOptions, ExtractJwt, VerifyCallbackWithRequest } from 'passport-jwt'
import jwt from 'jsonwebtoken'

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
  secretOrKey: 'kenote'
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
    return done(null, payload)
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
