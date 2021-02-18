import { ServerFactory } from '@kenote/core'
import { ServiceEngine } from '@kenote/koa'
import ApplicationModule from './application.module'

async function bootstrap () {
  /**
   * 加载引擎框架
   * Express -- 需要引入模块 @kenote/express
   * Koa2    -- 需要引入模块 @kenote/koa
   */
  let engine = new ServiceEngine({ keys: ['kenote'] })
  // 创建服务并加载根模块
  let server = await ServerFactory(engine).create(ApplicationModule)
  // 监听服务到指定端口
  server.app.listen(process.env.HTTP_PORT ?? 4000, () => {
    console.log(`Http Server Running to http://localhost:%d`, process.env.HTTP_PORT ?? 4000)
  })
}

// 启动服务
bootstrap()