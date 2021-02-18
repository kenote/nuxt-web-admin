import { Module } from '@kenote/core'
import * as controllers from '~/controller'

@Module({
  // 路由请求入口
  path: '/api',
  // 路由控制器
  controller: Object.entries(controllers).map( ([key, val]) => val ),
  // 选项
  options: {
    // 跨域设置
    core: true,
    // HTTP 头信息
    headers: {}
  }
})
export default class ControllerModule {}