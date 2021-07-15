import { Module } from '@kenote/core'
import AccountController from './account'
import ChannelController from './channel'
import GroupController from './group'
import TeamController from './team'
import TicketController from './ticket'
import UserController from './user'

@Module({
  // 路由请求入口
  path: '/api',
  // 路由控制器
  controller: [ 
    // 账号相关
    AccountController, 
    // 频道相关
    ChannelController, 
    // 用户组相关
    GroupController, 
    // 团队相关
    TeamController, 
    // 票据相关
    TicketController, 
    // 用户相关
    UserController 
  ],
  // 选项
  options: {
    // 跨域设置
    core: true,
    // HTTP 头信息
    headers: {}
  }
})
export default class ControllerApiModule {}