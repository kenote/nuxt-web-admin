import path from 'path'
import { Module, Context } from '@kenote/core'
import ControllerModule from './application.controller'
import sessionPlugin from '~/plugins/session'
import passportPlugin from '~/plugins/passport'
import Restful from '~/middlewares/restful'
import nuxtPulgin from '~/plugins/nuxt'

@Module({
  /**
   * key --- 表示路由请求前缀
   * val --- 表示实际物理路径
   */
  statics: {
    '/': path.resolve(process.cwd(), 'static')
  },
  options: {
    dynamic: true
  }
})
class StaticModule {}

@Module({
  // 设定模版目录
  viewDir: path.resolve(process.cwd(), 'views'),
  // 使用引擎名称；需要安装相应模块
  engine: 'nunjucks',
  // 模版文件扩展名
  extension: 'njk'
})
class TemplateModule {}

@Module({
  // 功能模块
  imports: [ StaticModule, TemplateModule, ...ControllerModule ],
  // 插件
  plugins: [ sessionPlugin, passportPlugin ],
  // 中间件
  middlewares: [ Restful ],
  // SSR 插件
  ssrPlugins: [ nuxtPulgin ],
  // 异常处理
  httpException: {
    // 404 Not Found
    notFound: async (ctx: Context) => {
      return await ctx.status(404).render('error', { message: 'This page could not be found.' })
    },
    /**
     * 500 Internal ServerError
     * 此处不支持 async 方法
     */
    exception: (err: any, ctx: Context) => {
      ctx.renderException('error', { message: 'This page could internal server error' })
    }
  }
})
export default class ApplicationModule {}