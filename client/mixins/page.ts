import { Component, Vue, Provide, Watch } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { Channel } from '@/types/channel'
import { Channel as IChannel } from 'kenote-config-helper'
import { oc } from 'ts-optchain'
import { ResponseUserDocument } from '@/types/proxys/user'
import { HeaderOptions } from '@/utils/http'


@Component<PageMixin>({
  created () {
    this.getPageSetting()
    this.httpOptions = {
      token: this.token
    }
  },
})
export default class PageMixin extends Vue {

  @Store.Auth.State auth!: ResponseUserDocument
  @Store.Auth.Getter token!: string
  @Store.Auth.Getter authLevel!: number
  @Store.Setting.Getter selectedChannel!: Channel.element

  @Provide() initinal: boolean = true
  @Provide() pageSetting: Channel.navigation = { index: '0', name: '' }
  @Provide() loading: boolean = false
  @Provide() httpOptions: HeaderOptions = {}

  oc = oc

  getPageSetting () {
    setTimeout(() => {
      let selectedChannel = JSON.parse(JSON.stringify(this.selectedChannel))
      let channelStore = new IChannel(selectedChannel)
      let pageSetting = channelStore.find(this.$route.path)
      this.pageSetting = pageSetting!
      this.initinal = false
    }, 500)
  }
}