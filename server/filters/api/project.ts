import { Context, NextHandler } from '@kenote/core'
import { filterData, validSign } from 'parse-string'
import { loadConfig } from '@kenote/config'
import ruleJudgment from 'rule-judgment'
import { Project } from '@/types/services/project'
import { omit, get, compact, uniq, concat } from 'lodash'
import { Configure } from '~/services/protobuf'

export async function request (ctx: Context, next: NextHandler) {
  let { nextError, customize, parseProps, httpError, ErrorCode, Bcrypt } = ctx.service
  let { channel, tag } = ctx.params
  let payload = ctx.method === 'GET' ? ctx.query : ctx.body
  try {
    let allAPIOptions = loadConfig<Project.API[]>(`project/${channel}/api`, { type: 'array' })
    let apiOptions  = allAPIOptions?.find( v => !!v.router.find( ruleJudgment({ method: ctx.method, path: tag }) ) )
    if (!apiOptions) return await ctx.notfound()
    let tcpSocketOptions = loadConfig<Configure>(`project/${channel}/setting`, { mode: 'merge' })
    let { props } = apiOptions
    let whitelist = uniq(compact(concat(tcpSocketOptions.whitelist, apiOptions.whitelist)))
    // 检查白名单
    if (whitelist.length > 0 && !whitelist.find( v => new RegExp(v).test(ctx.clientIP) )) {
      throw httpError(ErrorCode.ERROR_NOTIN_WHITELIST)
    }
    let nextPayload: Project.NextPayload = { 
      options: apiOptions, 
      tcpSocket: tcpSocketOptions
    }
    let authenticationState: Project.Authentication | null = null
    let isUser: true | false | 'Unauthorized' = false
    // 鉴权判断
    if (apiOptions.authentication) {
      for (let authentication of apiOptions.authentication) {
        authenticationState = authentication
        if (authentication.type === 'jwt') {
          let user = await ctx.jwtUser() 
          if (user) {
            isUser = ruleJudgment({ ...authentication.jwt })(user)
            if (isUser) break
          }
          else {
            isUser = 'Unauthorized'
          }
        }
        else if (authentication.type === 'sign') {
          apiOptions.payload?.push({
            key: authentication.sign?.field ?? 'sign',
            type: 'string',
            rules:authentication.sign?.debug ? undefined : [
              { required: true, message: '缺少验签', code: 1000 }
            ],
            md5: authentication.sign?.debug ? authentication.sign?.md5 : undefined
          })
        }
      }
    }
    // 验证请求参数
    if (apiOptions.payload) {
      let result = filterData(apiOptions.payload, customize)(payload)
      if (authenticationState?.type === 'sign') {
        let valid = validSign(authenticationState?.sign?.md5 ?? '', 'sign')(result)
        if (!valid) {
          throw httpError(ErrorCode.ERROR_VALID_SIGNATURE_FAIL)
        }
      }
      nextPayload.payload = omit(parseProps(props)(result), [authenticationState?.sign?.field ?? 'sign'])
    }
    else {
      nextPayload.payload = payload
    }
    // 如果使用 JWT 方式鉴权
    if (authenticationState?.type === 'jwt') {
      if (isUser === 'Unauthorized') {
        return await ctx.status(401).send('Unauthorized')
      }
      else if (isUser === false) {
        throw httpError(ErrorCode.ERROR_AUTH_FLAG_ACCESS)
      }
      let serverTag = String(get(ctx.query, 't'))
      // 检查 serverTag 使用权限
      if (nextPayload.options.message) {
        let server = nextPayload.tcpSocket.Server.find( r => r.key.toLowerCase() === serverTag.toLowerCase() )
        if (server) {
          nextPayload.options.message.serverTag = serverTag
        }
      }
    }
    ctx.payload = nextPayload
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}