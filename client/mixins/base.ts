import { Component, Vue, Provide } from 'nuxt-property-decorator'
import { Store, Types } from '~/store'
import { UserDocument } from '@/types/services/db'
import { parseCommand, parseProps } from '@/utils'

@Component<BaseMixin>({
 name: 'base-mixin'
})
export default class BaseMixin extends Vue {

  @Store.Auth.State 
  auth!: UserDocument | null

  @Store.Auth.State 
  timestamp!: number

  @Store.Auth.Getter 
  token!: string

  @Store.Auth.Getter 
  level!: number

  @Store.Setting.State 
  site_url!: string

  @Provide()
  types = Types

  parseProps = parseProps

  handleCommand (value: string) {
    let command = parseCommand(value)
    if (!command) return
    console.log(command)
    // 处理自定义指令
    if (command.type === 'command') {
      switch (command.path) {
        case 'fullscreen':
          this.toggleFullScreen()
          break
        default:
          break
      }
    }
    // 处理内部路由
    else if (command.type === 'router') {
      this.$router.push(command.path)
    }
    // 处理外部链接
    else if (command.type === 'http') {
      let link = document.createElement('a')
      link.href = command.path
      link.target = '_blank'
      link.click()
    }
  }

  /**
   * 切换全屏
   */
  toggleFullScreen () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } 
    else {
      document.exitFullscreen && document.exitFullscreen()
    }
  }
  
}