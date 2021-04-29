import { Middleware, Action, Context, Property } from '@kenote/core'
import { HttpError } from 'http-errors'
import * as service from '~/services'
import { setJwToken } from './auth'
import { UserDocument } from '@/types/services/db'
import fs from 'fs'
import path from 'path'
import { loadConfig } from '@kenote/config'
import { ServerConfigure } from '@/types/config'
import ruleJudgment from 'rule-judgment'

@Middleware({
  // HTTP 头信息
  headers: {}
})
export default class Restful {

  /**
   * 绑定一个方法
   */
  @Action()
  notfound (ctx: Context) {
    return async () => {
      await ctx.status(404)
    }
  }

  /**
   * 绑定一个方法；并指定名称为 api
   */
  @Action('api')
  api (ctx: Context) {
    return (info: any, error?: HttpError) => {
      if (error) {
        let { message } = error
        ctx.json({ error: message })
      }
      else {
        ctx.json({ data: info })
      }
    }
  }

  /**
   * 过滤用户等级
   */
  @Action('filterUserLevel')
  filterUserLevel (ctx: Context) {
    return (level: number, minLevel: number) => {
      let { ErrorCode, httpError } = service
      let authLevel = ctx.user?.group.level
      if (authLevel === 9999) return
      if (authLevel < minLevel) {
        throw httpError(ErrorCode.ERROR_ONLY_ADVANCED_ADMIN)
      }
      if (level >= authLevel) {
        throw httpError(ErrorCode.ERROR_BYLOND_LEVEL_OPERATE)
      }
    }
  }

  @Property()
  service (ctx: Context) {
    return service
  }

  @Property()
  db (ctx: Context) {
    return service.db
  }

  @Action()
  setJwToken (ctx: Context) {
    return setJwToken
  }

  @Action()
  jwtLogin (ctx: Context) {
    return async (user: UserDocument) => {
      let jwtoken = ctx.setJwToken({ _id: user._id })
      ctx.cookie('jwtoken', jwtoken)
      await service.db.user.Dao.updateOne({ _id: user._id }, { jw_token: jwtoken })
      return { ...user, jw_token: jwtoken }
    }
  }

  @Action()
  downloadFile (ctx: Context) {
    return (filePath: string) => {
      if (!fs.existsSync(filePath)) {
        return ctx.notfound()
      }
      let fileStream = fs.readFileSync(filePath)
      let extname = path.extname(filePath)
      let { previewTypes } = loadConfig<ServerConfigure>('config/server', { mode: 'merge' })
      let contentType = previewTypes?.find( ruleJudgment({ extname: { $_in: extname } }) )?.type ?? 'application/octet-stream'
      ctx.setHeader('Content-Type', contentType)
      return ctx.send(fileStream)
    }
  }
}

// 扩展到 @kenote/core 中 Context 类型
declare module '@kenote/core' {
  interface Context {
    /**
     * 返回 Not Found.
     */
    notfound (): Promise<void>
    /**
     * 调用 API 出口
     * @param info 
     * @param error 
     */
    api (info: any, error?: Error): void
    /**
     * 过滤用户等级
     */
    filterUserLevel (level: number, minLevel: number): void
    /**
     * 调用 Services 接口
     */
    service: typeof service
    /**
     * 调用 DB 接口
     */
    db: typeof service.db
    /**
     * 设置 JWT Token
     */
    setJwToken: typeof setJwToken
    /**
     * JET 登录
     */
    jwtLogin (user: UserDocument): Promise<UserDocument>
    /**
     * Download
     */
     downloadFile (filePath: string): Context
  }
}