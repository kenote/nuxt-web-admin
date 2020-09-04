import { Component, Vue, Provide, Watch } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { Channel } from '@/types/channel'
import { Channel as IChannel, Maps } from 'kenote-config-helper'
import { oc } from 'ts-optchain'
import { ResponseUserDocument } from '@/types/proxys/user'
import { HeaderOptions } from '@/utils/http'
import { PageFlag } from '@/types/restful'
import * as api from '~/api'
import * as auth from '~/store/modules/auth'

@Component<PageMixin>({
  name: 'page-mixin',
  created () {
    this.getPageSetting()
    this.httpOptions = {
      token: this.token
    }
    this.flag = oc(this.flags)[this.$route.path]({})
    this.getAuthBookmark()
  },
})
export default class PageMixin extends Vue {

  @Store.Auth.State auth!: ResponseUserDocument
  @Store.Auth.Getter token!: string
  @Store.Auth.Getter authLevel!: number
  @Store.Setting.State channels!: Channel.element[]
  @Store.Setting.State flags!: Maps<PageFlag.item>
  @Store.Setting.Getter selectedChannel!: Channel.element
  @Store.Setting.Getter projectChannels!: Channel.element[]

  @Provide() initinal: boolean = true
  @Provide() pageSetting: Channel.navigation = { index: '0', name: '' }
  @Provide() loading: boolean = false
  @Provide() httpOptions: HeaderOptions = {}
  @Provide() flag: PageFlag.item = {}

  oc = oc

  getPageSetting (): void {
    setTimeout(() => {
      let selectedChannel = JSON.parse(JSON.stringify(this.selectedChannel))
      let channelStore = new IChannel(selectedChannel)
      let pageSetting = channelStore.find(this.$route.path)
      this.pageSetting = pageSetting!
      this.initinal = false
    }, 500)
  }
  
  getAuthBookmark (): void {
    setTimeout(async () => {
      try {
        let result = await api.getData({ method: 'get', url: '/api/v1/plan/bookmark', options: this.httpOptions })
        if (result.error === 0) {
          this.$store.commit(`${auth.name}/${auth.types.BOOKMARKS}`, result.data)
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }
}


// favorites