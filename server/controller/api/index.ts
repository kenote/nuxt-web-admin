import { Module } from '@kenote/core'
import GroupController from './group'
import AccountController from './account'

@Module({
  // 路由请求入口
  path: '/api',
  // 路由控制器
  controller: [ GroupController, AccountController ],
  // 选项
  options: {
    // 跨域设置
    core: true,
    // HTTP 头信息
    headers: {}
  }
})
export default class ControllerApiModule {}