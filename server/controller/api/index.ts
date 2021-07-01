import { Module } from '@kenote/core'
import GroupController from './group'
import AccountController from './account'
import ChannelController from './channel'
import TicketController from './ticket'

@Module({
  // 路由请求入口
  path: '/api',
  // 路由控制器
  controller: [ GroupController, AccountController, ChannelController, TicketController ],
  // 选项
  options: {
    // 跨域设置
    core: true,
    // HTTP 头信息
    headers: {}
  }
})
export default class ControllerApiModule {}