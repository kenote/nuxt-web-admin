import { ServerFactory } from '@kenote/core'
import { ServiceEngine } from '@kenote/koa'
import ApplicationModule from './application.module'
import { loadConfig } from '@kenote/config'
import { ServerConfigure } from '@/types/config'
import logger from '~/services/logger'
import { connect } from './models'

async function bootstrap () {
  let { host, port, secretKey, mongoOpts } = loadConfig<ServerConfigure>('config/server', { mode: 'merge' })
  await connect(mongoOpts!)
  /**
   * 加载引擎框架
   * Express -- 需要引入模块 @kenote/express
   * Koa2    -- 需要引入模块 @kenote/koa
   */
  let engine = new ServiceEngine({ keys: [secretKey ?? 'kenote'] })
  // 创建服务并加载根模块
  let server = await ServerFactory(engine).create(ApplicationModule)
  // 监听服务到指定端口
  let Port = port ?? process.env.HTTP_PORT ?? 4000
  let Host = host ?? 'localhost'
  server.app.listen(Port, Host, () => {
    logger.info(`Http Server Running to http://localhost:%d`, Port)
  })
}

// 启动服务
bootstrap()