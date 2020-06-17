<template>
  <fragment v-if="auth">
    <!-- <error-page v-if="selectedChannel.id === 0 && $route.path !== homepage" /> -->
    <div class="dashboard_warpper" >
      <dashboard-header :platforms="platforms" :current-channel="selectedChannel" @change-platform="handlePlatform">
        <dashboard-authpanel :auth="auth" :user-entrance="dashboardOpts.userEntrance" @command="handleCommand" />
      </dashboard-header>
      <div class="bodyer">
        <div class="sidebar-nav" v-bind:style="collapse ? 'flex: 0 0 64px' : 'flex: 0 0 260px'" v-if="selectedChannel.id > 0">
          <template v-for="(channel, key) in channels">
            <el-collapse-transition :key="key" v-if="channel.id === selectedChannel.id">
              <dashboard-sidebar 
                :navs="accessNavs(channel.navs, access)"
                :defaultActive="$route.path"
                :disable-mode="dashboardOpts.disableMode"
                :background-color="'#444c54'"
                :text-color="'#ffffff'"
                :active-text-color="'#ffd04b'"
                :router="true"
                :collapse="collapse" >

              </dashboard-sidebar>
            </el-collapse-transition>
          </template>
          <div class="collapsed" @click="handleCollapse">
            <i class="iconfont" v-bind:class="collapse ? 'icon-menu-fold' : 'icon-menu-unfold'"></i>
          </div>
        </div>
        <div class="dashboard-page" >
          <nuxt v-if="permission"></nuxt>
          <error-page v-else :statusCode="403" message="Forbidden" />
          <dashboard-drawer :visible="drawerVisible" @close="handleCloseDrawer" ref="theDrawer">
            <!-- 加载侧栏 -->
          </dashboard-drawer>
        </div>
      </div>
      
    </div>
  </fragment>
  <div v-else v-loading="true" />
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { ResponseUserDocument } from '@/types/proxys/user'
import { Channel } from '@/types/channel'
import '~/assets/scss/dashboard/warpper.scss'
import '~/assets/scss/dashboard/page.scss'
import { Route } from 'vue-router'
import { PageFlag, DashboardOptions } from '@/types/restful'
import { Maps, getChannelId, Navigation } from 'kenote-config-helper'
import { oc } from 'ts-optchain'
import * as userUtil from '@/utils/user'
import { orderBy } from 'lodash'
import * as api from '~/api'
import * as auth from '~/store/modules/auth'
import { parseCommand } from '@/utils'

@Component<DashboardLayout>({
  name: 'dashboard-layout',
  created () {
    let { group } = this.auth
    let platform = group.level < 9000 ? userUtil.getPlatform(this.auth) : undefined
    this.platforms = this.filterChannels(platform)
  },
  async mounted () {
    document.body.className = 'dashboard_body'
    await this.updateChannel(this.$route.path)
  }
})
export default class DashboardLayout extends Vue {

  @Store.Auth.State auth!: ResponseUserDocument
  @Store.Auth.Getter token!: string
  @Store.Setting.State channels!: Channel.element[]
  @Store.Setting.State flags!: Maps<PageFlag.item>
  @Store.Setting.State dashboardOpts!: DashboardOptions
  @Store.Setting.Action selectChannel!: (id: number) => Promise<void>
  @Store.Setting.Getter selectedChannel!: Channel.element

  @Provide() permission: boolean = true
  @Provide() homepage: string = '/dashboard'
  @Provide() platforms: Channel.element[] = []
  @Provide() access: string[] | null = null
  @Provide() collapse: boolean = false
  @Provide() drawerVisible: boolean = false

  @Watch('$route')
  async onRouteChange (val: Route, oldVal: Route): Promise<void> {
    await this.updateChannel(val.path)
  }

  @Watch('permission')
  onPermissionChange (val: Route, oldVal: Route): void {
    if (!val) {
      location.href = this.homepage
    }
  }

  handleCollapse (): void {
    this.collapse = !this.collapse
  }

  async updateChannel (routerPath: string): Promise<void> {
    if (!this.auth) return
    let { group, teams, access } = this.auth
    let pageFlag = this.flags[routerPath]
    let permission = oc(pageFlag).access(1000) <= group.level
    let pageAccess: string[] | null = null
    if (group.level < 9000 && permission) {
      pageAccess = userUtil.getAccess(this.auth)
      permission = pageAccess.includes(routerPath)
    }
    this.permission = routerPath === this.homepage ? true : permission
    this.access = pageAccess

    let channelId = getChannelId(this.channels, routerPath)
    if (this.selectedChannel.id === channelId) return
    await this.selectChannel(channelId)
  }

  filterChannels (platform?: number[]): Channel.element[] {
    let channels = orderBy(this.channels, ['id'], ['asc'])
    if (!platform) return channels
    return channels.filter( o => platform.includes(o.id) )
  }

  handlePlatform (channelId: number) {
    if (this.selectedChannel.id === channelId) return
    let channel = this.channels.find( o => o.id === channelId )!
    this.$router.push(channel.default!)
  }

  accessNavs (navs: Navigation[], access?: string[]): Navigation[] {
    for (let nav of navs) {
      if (nav.children) {
        nav.children = this.accessNavs(nav.children, access)
      }
      else {
        if (!nav.disabled) {
          nav.disabled = access && !access.includes(nav.index) || false
        }
      }
    }
    return navs
  }

  handleCommand (value: string): void {
    let command = parseCommand(value)
    if (!command) return
    if (command.type === 'command') {
      switch (command.path) {
        case 'logout':
          this.logout()
          break
        case 'collect':
          this.drawerVisible = true
          break
        default:
          break
      }
    }
    else if (command.type === 'router') {
      this.$router.push(command.path)
    }
  }

  handleCloseDrawer () {
    this.drawerVisible = false
  }

  logout (): void {
    setTimeout(async () => {
      try {
        let result = await api.logout({ token: this.token })
        if (result.error === 0 && result.data) {
          this.$store.commit(`${auth.name}/${auth.types.AUTH}`, null)
          this.$router.push(`/login?url_callback=${this.$route.path}`)
          return
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }
  
}
</script>