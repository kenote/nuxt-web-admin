import { Component, mixins, Provide } from 'nuxt-property-decorator'
import BaseMixin from './base'
// import { HttpClientOptions } from '@/utils/http-client'
import { Channel, NavMenu, HttpClientOptions } from '@/types/client'
import { dataNodeProxy } from '@kenote/common'
import { Store, Types } from '~/store'
import { AccountConfigure } from '@/types/config'

@Component<PageMixin>({
  name: 'page-mixin',
  created () {
    this.getPageSetting()
    this.httpOptions = {
      token: this.token
    }
  }
})
export default class PageMixin extends mixins(BaseMixin) {

  @Store.Setting.State
  refresh!: boolean

  @Store.Setting.State
  accountOptions!: AccountConfigure

  @Store.Setting.Getter
  avatarOptions!: NavMenu.AvatarOptions
 
  @Provide()
  loading: boolean = false

  @Provide()
  times: number = 0

  @Provide()
  httpOptions: HttpClientOptions = {}

  @Provide()
  initinal: boolean = true

  @Provide()
  pageSetting: Partial<Channel.DataNode> = {}

  sendWait (step: number) {
    this.times = step
    let timer: NodeJS.Timeout | null = setInterval(() => {
      this.times --
      if (this.times <= 0) {
        clearTimeout(timer!)
        timer = null
      }
    }, 1000)
  }

  getPageSetting () {
    setTimeout(() => {
      let pageSetting = dataNodeProxy(this.selectedChannel.children ?? []).find({ route: this.$route.path })
      this.pageSetting = pageSetting ?? {}
      this.initinal = false
    }, 500)
  }

  completeRefresh () {
    this.$store.commit(Types.setting.REFRESH, false)
  }
   
}