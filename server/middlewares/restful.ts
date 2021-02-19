import { Middleware, Action, Context, Property } from '@kenote/core'
import { HttpError } from 'http-errors'
import * as service from '~/services'
import { setJwToken } from './auth'

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

  @Property()
  service (ctx: Context) {
    return service
  }

  @Action()
  setJwToken (ctx: Context) {
    return setJwToken
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
     * 调用 Services 接口
     */
    service: typeof service
    /**
     * 设置 JWT Token
     */
    setJwToken: typeof setJwToken
  }
}