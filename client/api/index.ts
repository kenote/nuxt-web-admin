import httpClient, { HeaderOptions, formatRestful } from '@/utils/http'
import { RestfulInfoByError, Security } from '@/types/restful'
import * as PassportAPI  from '@/types/apis/passport'
import * as Ucenter from '@/types/apis/ucenter'
import { omit, result } from 'lodash';
import { RemoveOptions } from '@/types/proxys'
import { Channel } from '@/types/channel'
import Alicloud from '@/types/alicloud'

/**
 *  获取API数据
 */
export async function getData (api: Channel.api): Promise<RestfulInfoByError> {
  let { method, url, params, options } = api
  let restful = await httpClient.sendData(method, url, params, options)
  return formatRestful(restful)
}

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
export async function check (values: PassportAPI.checkValues, type: PassportAPI.checkUserType, options?: HeaderOptions): Promise<RestfulInfoByError> {
  let url = options ? `/api/v1/security/check/${type}` : `/api/v1/passport/check/${type}`
  let restful = await httpClient.put(url, values, options)
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
  let restful = await httpClient.post(`/api/v1/ucenter/group/${type}`, data, options)
  return formatRestful(restful)
}

/**
 * 创建用户组
 */
export async function createGroup (data: Ucenter.createGroup, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/group/create`, data, options)
  return formatRestful(restful)
}

/**
 * 编辑用户组
 */
export async function editGroup (_id: string, data: Ucenter.createGroup, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/group/edit/${_id}`, data, options)
  return formatRestful(restful)
}

/**
 * 删除用户组
 */
export async function removeGroup (_id: string, data: RemoveOptions, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.delete(`/api/v1/ucenter/group/${_id}`, data, options)
  return formatRestful(restful)
}

/**
 * 编辑用户组频道入口
 */
export async function platformGroup (_id: string, data: Ucenter.platform, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/group/platform/${_id}`, data, options)
  return formatRestful(restful)
}

/**
 * 编辑用户组访问权限
 */
export async function accessGroup (_id: string, data: Ucenter.access, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/group/access/${_id}`, data, options)
  return formatRestful(restful)
}

/**
 * 团队列表
 */
export async function teamList (channel: string | null, options: HeaderOptions): Promise<RestfulInfoByError> {
  let url = channel ? `/api/v1/ucenter/team/list/${channel}` : `/api/v1/ucenter/team/list`
  let restful = await httpClient.get(url, null, options)
  return formatRestful(restful)
}

/**
 * 创建团队
 */
export async function createTeam (data: Ucenter.createTeam, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/team/create`, data, options)
  return formatRestful(restful)
}

/**
 * 编辑团队
 */
export async function editTeam (_id: string, data: Ucenter.createTeam, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/team/edit/${_id}`, data, options)
  return formatRestful(restful)
}

/**
 * 删除团队
 */
export async function removeTeam (_id: string, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.delete(`/api/v1/ucenter/team/${_id}`, null, options)
  return formatRestful(restful)
}

/**
 * 编辑团队频道入口
 */
export async function platformTeam (_id: string, data: Ucenter.platform, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/team/platform/${_id}`, data, options)
  return formatRestful(restful)
}

/**
 * 编辑团队访问权限
 */
export async function accessTeam (_id: string, data: Ucenter.access, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/team/access/${_id}`, data, options)
  return formatRestful(restful)
}

/**
 * 获取团队成员
 */
export async function peopleList (_id: string, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/team/people/${_id}`, null, options)
  return formatRestful(restful)
}

/**
 * 检索可选用户
 */
export async function inviteeSuggestions (keywords: string, _id: string, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.get(`/api/v1/ucenter/team/invitee_suggestions/${_id}`, { q: keywords }, options)
  return formatRestful(restful)
}

/**
 * 设置团队成团
 */
export async function setPeople (_id: string, data: Ucenter.peoples, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/team/people/${_id}/set`, data, options)
  return formatRestful(restful)
}

/**
 * 移除团队成员
 */
export async function removePeople (_id: string, data: Ucenter.peoples, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.delete(`/api/v1/ucenter/team/people/${_id}`, data, options)
  return formatRestful(restful)
}

/**
 * 邀请码列表
 */
export async function ticketList (channel: string | null, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.get(`/api/v1/ucenter/ticket/list`, null, options)
  return formatRestful(restful)
}

/**
 * 创建邀请码
 */
export async function createTicket (data: Ucenter.createTicket, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/ticket/create`, data, options)
  return formatRestful(restful)
}

/**
 * 删除邀请码
 */
export async function removeTicket (_id: string | string[], options: HeaderOptions): Promise<RestfulInfoByError> {
  let url = `/api/v1/ucenter/ticket/${_id}`
  let params = {}
  if (Array.isArray(_id)) {
    url = `/api/v1/ucenter/ticket`
    params = { _ids: _id }
  }
  let restful = await httpClient.delete(url, params, options)
  return formatRestful(restful)
}

/**
 * 用户列表
 */
export async function userList (data: Ucenter.findUser, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/user/list`, data, options)
  return formatRestful(restful)
}

/**
 * 编辑用户信息
 */
export async function editUser (_id: string, data: Ucenter.createUser, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/user/edit/${_id}`, data, options)
  return formatRestful(restful)
}

/**
 * 创建新用户
 */
export async function createUser (data: Ucenter.createUser, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/user/create`, data, options)
  return formatRestful(restful)
}

/**
 * 删除用户
 */
export async function removeUser (_id: string | string[], options: HeaderOptions): Promise<RestfulInfoByError> {
  let url = `/api/v1/ucenter/user/${_id}`
  let params = {}
  if (Array.isArray(_id)) {
    url = `/api/v1/ucenter/user`
    params = { _ids: _id }
  }
  let restful = await httpClient.delete(url, params, options)
  return formatRestful(restful)
}

/**
 * 修改用户密码
 */
export async function setPass (_id: string, data: Ucenter.setPass, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/ucenter/user/setpass/${_id}`, data, options)
  return formatRestful(restful)
}

/**
 * 发送激活邮件 email_verify
 */
export async function userVerifyEmail (_id: string, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.get(`/api/v1/ucenter/user/email_verify/${_id}`, null, options)
  return formatRestful(restful)
}

/**
 * 修改基本信息
 */
export async function baseInfo (data: Ucenter.createUser, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.post(`/api/v1/passport/baseinfo`, data, options)
  return formatRestful(restful)
}

/**
 * 阿里云服务
 */
export async function alicloud (request: Alicloud.request, options: HeaderOptions): Promise<RestfulInfoByError> {
  let { endpoint, action, tag, params } = request
  let restful = await httpClient.post(`/api/v1/alicloud/${endpoint}/${action}?t=${tag}`, params!, options)
  return formatRestful(restful)
}

/**
 * 编辑项目线路
 */
export async function rtspsTeam (_id: string, data: Ucenter.rtsps, options: HeaderOptions): Promise<RestfulInfoByError> {
  let restful = await httpClient.put(`/api/v1/ucenter/team/rtsps/${_id}`, data, options)
  return formatRestful(restful)
}
