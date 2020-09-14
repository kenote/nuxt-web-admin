<template>
  <client-only placeholder="Page Loading...">
    <fragment v-if="auth">
      <!-- <error-page v-if="selectedChannel.id === 0 && $route.path !== homepage" /> -->
      <div class="dashboard_warpper" >
        <dashboard-header :platforms="platforms" :current-channel="selectedChannel" :collapse="collapse" @collapse="handleCollapse" @change-platform="handlePlatform">
          <div class="header-link-box" v-if="bookmarks.length > 0">
            <a class="header-link " @click="handleCommand('command:bookmark')">
              <i class="el-icon-star-off" style="font-size:16px"></i>&nbsp;书签
            </a>
          </div>
          <dashboard-authpanel :user-entrance="dashboardOpts.userEntrance" @command="handleCommand" />
        </dashboard-header>
        <div class="bodyer" v-bind:style="collapse ? 'left:-260px' : ''">
          <div class="sidebar-nav" v-bind:style="'flex: 0 0 260px'" v-if="selectedChannel.id > 0">
            <perfect-scrollbar>
              <template v-for="(channel, key) in channels">
                <el-collapse-transition :key="key" v-if="channel.id === selectedChannel.id">
                  <dashboard-sidebar v-if="!loading.channel"
                    :navs="accessNavs(channel.navs, access)"
                    :default-active="$route.path"
                    :disable-mode="dashboardOpts.disableMode"
                    :background-color="'#444c54'"
                    :text-color="'#ffffff'"
                    :active-text-color="'#ffd04b'"
                    :router="true"
                    :collapse="false" >

                  </dashboard-sidebar>
                </el-collapse-transition>
              </template>
            </perfect-scrollbar>
          </div>
          <div class="dashboard-page" >
            <nuxt v-if="permission"></nuxt>
            <error-page v-else :statusCode="403" message="Forbidden" />
            <dashboard-drawer class="bookmark" :lock="editMode" :visible="drawerType === 'bookmark'" @close="handleCloseDrawer" v-if="bookmarks.length > 0" >
              <dashboard-bookmark :data="bookmarks" @command="handleCommand" @edit-mode="handleEditMode" />
            </dashboard-drawer>
          </div>
        </div>
      </div>
    </fragment>
    <div v-else v-loading="true" />
  </client-only>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch, mixins } from 'nuxt-property-decorator'
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
import { parseCommand, parseProps } from '@/utils'
import LayoutMixin from '~/mixins/layout'

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
export default class DashboardLayout extends mixins(LayoutMixin) {

  @Store.Setting.State channels!: Channel.element[]
  @Store.Setting.State flags!: Maps<PageFlag.item>
  @Store.Setting.State dashboardOpts!: DashboardOptions
  @Store.Setting.State loading!: Maps<boolean>
  @Store.Setting.Action selectChannel!: (id: number) => Promise<void>
  @Store.Setting.Getter selectedChannel!: Channel.element

  @Provide() permission: boolean = true
  @Provide() homepage: string = '/dashboard'
  @Provide() platforms: Channel.element[] = []
  @Provide() access: string[] | null = null
  @Provide() collapse: boolean = false
  @Provide() drawerVisible: boolean = false
  @Provide() drawerType: string = ''
  @Provide() editMode: boolean = false

  @Watch('$route')
  async onRouteChange (val: Route, oldVal: Route): Promise<void> {
    await this.updateChannel(val.path)
    this.drawerType = ''
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

  handleEditMode (value: boolean): void {
    this.editMode = value
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
          if (this.authLevel >= 9000) {
            let pageFlag = this.flags[nav.index]
            nav.disabled = oc(pageFlag).access(1000) >= this.authLevel
          }
          else {
            nav.disabled = access && !access.includes(nav.index) || false
          }
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
          this.drawerType = 'collect'
          break
        case 'bookmark':
          this.drawerVisible = true
          this.drawerType = 'bookmark'
          break
        default:
          break
      }
    }
    else if (command.type === 'router') {
      this.$router.push(command.path)
    }
    else if (command.type === 'http') {
      let link = document.createElement('a')
      link.target = '_blank'
      link.href = command.path
      link.click()
    }
  }

  handleSelect(key, keyPath, d) {
    console.log(key, keyPath, d)
  }

  handleCloseDrawer () {
    this.drawerVisible = false
    this.drawerType = ''
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