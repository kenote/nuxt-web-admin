import { Component, mixins, Provide } from 'nuxt-property-decorator'
import BaseMixin from './base'
import { Channel, NavMenu, HttpClientOptions } from '@/types/client'
import { dataNodeProxy, FilterQuery } from '@kenote/common'
import { Store, Types } from '~/store'
import { AccountConfigure } from '@/types/config'
import { isString, isPlainObject } from 'lodash'
import { parseTemplate } from '@/utils'
import jsYaml from 'js-yaml'
import ruleJudgment from 'rule-judgment'

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

  @Provide()
  env: Record<string, any> = {}

  isFilter (conditions: FilterQuery<any> | string) {
    if (!conditions) return true
    let query = conditions
    if (isString(conditions)) {
      query = jsYaml.safeLoad(parseTemplate(conditions, this.env)) as FilterQuery<any>
      if (!isPlainObject(query)) return true
    } 
    let filter = ruleJudgment(query as FilterQuery<any>)
    return filter(this.env)
  }

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