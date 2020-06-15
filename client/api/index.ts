import httpClient, { HeaderOptions, formatRestful } from '@/utils/http'
import { RestfulInfoByError } from '@/types/restful'
import * as PassportAPI  from '@/types/apis/passport'

/**
 * 校验访问令牌
 */
export async function accesstoken (options: HeaderOptions, prefix: string = ''): Promise<RestfulInfoByError> {
  let restful = await httpClient.get(`${prefix}/api/v1/passport/accesstoken`, null, options)
  return formatRestful(restful)
}

/**
 * 用户登出
 */
export async function logout (options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.get(`/api/v1/passport/logout`, null, options)
  return formatRestful(restful)
}

/**
 * 用户登录
 */
export async function login (data: PassportAPI.login): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/passport/login`, data)
  return formatRestful(restful)
}

/**
 * 验证邀请码
 */
export async function invitation (cdkey: string): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/passport/invitation`, { cdkey })
  return formatRestful(restful)
}

/**
 * 验证名称是否占用，非登录用户
 */
export async function check (name: string, type: PassportAPI.checkUserType): Promise<RestfulInfoByError> {
  let restful = await httpClient.put(`/api/v1/passport/check/${type}`, { name })
  return formatRestful(restful)
}

/**
 * 用户注册
 */
export async function register (data: PassportAPI.registerDocument): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/passport/register`, data)
  return formatRestful(restful)
}

/**
 * 找回密码请求验证码
 */
export async function resetpwdCode (type: PassportAPI.verifyUserType, name: string): Promise<RestfulInfoByError> {
  let restful = await httpClient.put(`/api/v1/passport/resetpwd/code/${type}`, { name })
  return formatRestful(restful)
}

/**
 * 找回密码修改密码
 */
export async function resetpwd (type: PassportAPI.verifyUserType, data: PassportAPI.resetPwdDocument): Promise<RestfulInfoByError> {
  let restful = await httpClient.put(`/api/v1/passport/resetpwd/${type}`, data)
  return formatRestful(restful)
}