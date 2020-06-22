import httpClient, { HeaderOptions, formatRestful } from '@/utils/http'
import { RestfulInfoByError, Security } from '@/types/restful'
import * as PassportAPI  from '@/types/apis/passport'
import { omit } from 'lodash'

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
 * 验证名称是否占用
 */
export async function check (name: string, type: PassportAPI.checkUserType, options?: HeaderOptions): Promise<RestfulInfoByError> {
  let url = options ? `/api/v1/security/check/${type}` : `/api/v1/passport/check/${type}`
  let restful = await httpClient.put(url, { name }, options)
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

/**
 * 验证邮箱手机
 */
export async function verify_email_mobile (data: PassportAPI.verifyBaseDocument, type: PassportAPI.verifyUserType): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/passport/verify/${type}`, data)
  return formatRestful(restful)
}

/**
 * 发送激活邮件
 */
export async function sendVerifyEmail (user: string | null, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.get(`/api/v1/security/email_verify`, { user }, options)
  return formatRestful(restful)
}

/**
 * 发送验证码
 */
export async function sendCode (data: Security.sendCode, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.put(`/api/v1/security/sendcode/${data.type}`, omit(data, ['type']), options)
  return formatRestful(restful)
}

/**
 * 校验验证码  verifycode
 */
export async function verifyCode (data: Security.verifyCode, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/security/verifycode`, data, options)
  return formatRestful(restful)
}

/**
 * 修改密码
 */
export async function setPassword (data: Security.setPassword, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/security/setpassword`, data, options)
  return formatRestful(restful)
}

/**
 * 设置邮箱
 */
export async function setEmail (data: Security.setEmail, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/security/setemail`, data, options)
  return formatRestful(restful)
}

/**
 * 设置手机
 */
export async function setMobile (data: Security.setMobile, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/security/setmobile`, data, options)
  return formatRestful(restful)
}

/**
 * 用户组列表
 */
export async function groupList (data: any, type: 'list' | 'lite', options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/group/list`, data, options)
  return formatRestful(restful)
}