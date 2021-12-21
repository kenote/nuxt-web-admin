import { Module } from '@kenote/core'
import AccountController from './account'
import AlicloudController from './alicloud';
import ChannelController from './channel'
import GroupController from './group'
import NotificationController from './notification'
import OplogController from './oplog'
import PlanController from './plan'
import ProjectController from './project'
import TeamController from './team'
import TicketController from './ticket'
import ToolsController from './tools'
import UserController from './user'

@Module({
  // 路由请求入口
  path: '/api',
  // 路由控制器
  controller: [ 
    // 账号相关
    AccountController, 
    // 阿里云相关
    AlicloudController,
    // 频道相关
    ChannelController, 
    // 用户组相关
    GroupController, 
    // 消息通知相关
    NotificationController,
    // 日志相关
    OplogController,
    // 方案相关
    PlanController,
    // 项目相关
    ProjectController,
    // 团队相关
    TeamController, 
    // 票据相关
    TicketController, 
    // 工具相关
    ToolsController,
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