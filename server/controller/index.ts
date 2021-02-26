import { Module } from '@kenote/core'
import StoreController from './store'

@Module({
  // 路由请求入口
  path: '/',
  // 路由控制器
  controller: [ StoreController ],
  // 选项
  options: {
    
  }
})
export default class ControllerModule {}