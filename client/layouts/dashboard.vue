<template>
  <client-only placeholder="Page Loading...">
    <div class="warpper">
      <!-- 头部工具条 -->
      <header>
        <div class="header-start">
          <div class="header-link-box" v-if="channelId !== '0'">
            <a class="header-link header-link-icon" @click="handleCollapse">
              <i class="iconfont" v-bind:class="collapse ? 'icon-menu-fold' : 'icon-menu-unfold'"></i>
            </a>
          </div>
          <div class="header-link-box">
            <a class="header-link header-link-icon" @click="handleCommand('command:channels')">
              <i class="iconfont icon-gaikuang" style="font-size:18px;"></i>
            </a>
          </div>
          <div class="header-link-box">
            <nuxt-link class="header-link logo" to="/dashboard">
              <img src="/images/logo.png" />
            </nuxt-link>
          </div>
        </div>
        <div class="header-end">
          <navmenu
            classname="header-link"
            :data="dashboard.navmenu"
            :notification="notification"
            @command="handleCommand" >
            <search-bar 
              v-model="search" 
              placeholder="搜索控制台" 
              :data="channels" 
              :props="{ value: 'name', key: 'key', route: 'route', description: 'description', maps: 'maps' }"
              :env="env"
              @command="handleRouteTo" 
              class="header-link-box" 
              slot="prefix" />
            <authpanel slot="suffix" :options="dashboard.authpanel" @command="handleCommand" />
          </navmenu>
        </div>
      </header>

      <div class="bodyer" v-bind:style="collapse ? 'left:-260px' : ''">
        <!-- 侧栏导航 -->
        <div class="sidebar-nav" v-if="$route.path !== '/dashboard'" v-loading="loading.channel">
          <div v-if="selectedChannel.name" style="height:100%">
            <web-sidebar v-if="selectedChannel.name" 
              :title="selectedChannel.name"
              :icon="selectedChannel.icon"
              :data="getChannelData()"
              :default-active="$route.path"
              :access="access"
              :ignore-platform="accountOptions.platform"
              :platform="selectedChannel.label"
              :env="env"
              />
          </div>
        </div>
        <!-- 内容页面 -->
        <div class="page-main">
          <breadcrumb v-if="selectedChannel.name" :data="getChannelData()" :route-path="$route.path" />
          <div class="page-tools" v-if="!accessDisabled(pageSetting.disabled)">
            <el-button v-if="pageSetting && pageSetting.refresh"
              icon="el-icon-refresh" 
              @click="handleCommand('command:refresh')" 
              v-bind:class="refresh ? 'refresh' : ''">
            </el-button>
          </div>
          <perfect-scrollbar :options="{ suppressScrollX: true }" ref="mainScroll">
            <dashboard v-if="accessDisabled(pageSetting.disabled)" v-loading="refresh">
              <client-only placeholder="Page Loading...">
                <!-- 403 Forbidden -->
                <el-empty style="margin-top:80px">
                  <div slot="description">
                    <h3>403 Forbidden</h3>
                    <p>您尚未获得该页面的访问权限</p>
                  </div>
                </el-empty>
              </client-only>
            </dashboard>
            <nuxt v-else :style="selectedChannel.name ? '' : 'padding-top:20px;'"></nuxt>
          </perfect-scrollbar>
        </div>
      </div>
      <!-- 频道选项 -->
      <web-drawer title="频道导航" placement="left" width="250" :visible="drawerType === 'channels'" @close="handleCloseDrawer">
        <perfect-scrollbar :options="{ suppressScrollX: true }">
          <div class="main">
            <web-list 
              :data="(channels || []).map(parseProps({ key: 'key', name: 'name', icon: 'icon', link: 'route' }))" 
              :env="env"
              :exclude="platform"
              exclude-key="label"
              @command="path => path && handleCommand('router:' + path)" 
              />
          </div>
        </perfect-scrollbar>
      </web-drawer>
      <!-- 收藏夹 -->
      <web-drawer placement="right" width="260" :lock="editMode" :visible="drawerType === 'bookmark'" @close="handleCloseDrawer">

      </web-drawer>
      <!--  -->
      <task-poller>

      </task-poller>
    </div>
  </client-only>
</template>

<script lang="ts">
import { Component, mixins, Provide, Watch } from 'nuxt-property-decorator'
import BaseMixin from '~/mixins/base'
import '~/assets/scss/dashboard/warpper.scss'
import { parseCommand, isDisabled, runCommand } from '@/utils'
import { Store, Types } from '~/store'
import { NavMenu, Channel, HttpResult } from '@/types/client'
import { Route } from 'vue-router'
import { getChannelKey, dataNodeProxy } from '@kenote/common'
import { MetaInfo } from 'vue-meta'
import { UserDocument, AccoutNotificationDocument } from '@/types/services/db'
import { isEqual, get } from 'lodash'
import { getUserArrayInfo } from '@/utils/user'
import { AccountConfigure } from '@/types/config'
import { FilterQuery } from 'rule-judgment'
import ruleJudgment from 'rule-judgment';

@Component<DashboardLayout>({
  name: 'dashboard-layout',
  head () {
    return { ...this.metaInfo }
  },
  created () {
    this.env = {
      auth: this.auth
    }
    if (this.auth) {
      let { level } = this.auth.group
      this.platform = level >= 9000 ? null : getUserArrayInfo(this.auth, 'platform').concat(this.accountOptions?.platform)
      this.access = level >= 9000 ? null : getUserArrayInfo(this.auth, 'access')
    }
  },
  async mounted () {
    document.body.className = 'dashboard-body'
    await this.updateChannel(this.$route.path)
    // 订阅通知
    let pubsub  = this.dashboard.pubsub?.find(ruleJudgment({ key: 'dashboard' }))
    if (pubsub) {
      let socket = this.$websocket(pubsub?.url ?? '')
      socket.send('notification', {})
      socket.onMessage = response => {
        let { headers, body } = response
        let map = new Map()
        // 获取消息通知
        map.set('notification', () => {
          this.$store.commit(this.types.auth.NOTIFICATION, body.data)
          this.$store.commit(this.types.auth.UNREAD, body.counts)
        })
        map.get(headers.path)?.call(this)
      }
    }
  }
})
export default class DashboardLayout extends mixins(BaseMixin) {

  @Store.Setting.State 
  dashboard!: NavMenu.Configure

  @Store.Setting.State
  loading!: Record<string, boolean>

  @Store.Setting.State
  metaInfo!: MetaInfo

  @Store.Setting.State
  refresh!: boolean

  @Store.Setting.State
  accountOptions!: AccountConfigure

  @Store.Auth.State
  notification!: Array<AccoutNotificationDocument & { link?: string }>

  @Store.Auth.State
  unread!: number

  @Provide()
  env: Record<string, any> = {}

  @Provide()
  collapse: boolean = false

  @Provide()
  visible: boolean = false

  @Provide()
  search: string = ''

  @Provide() 
  drawerVisible: boolean = false

  @Provide() 
  drawerType: string = ''

  @Provide() 
  editMode: boolean = false

  @Provide()
  pageSetting: Partial<Channel.DataNode> = {}

  @Provide()
  platform: string[] | null = null

  @Provide()
  access: string[] | null = null

  isDisabled = isDisabled

  accessDisabled (value: boolean | FilterQuery<any> | string) {
    let disabled = isDisabled(value, this.env)
    if (disabled) return disabled
    let level = this.auth?.group?.level ?? 0
    if (level >= 9000) return false
    if (this.accountOptions?.platform?.includes(this.selectedChannel.label!)) return false
    if (this.$route.path === '/dashboard') return false
    return !this.access?.includes(this.$route.path)
  }

  @Watch('$route')
  async onRouteChange (val: Route, oldVal: Route) {
    if (val === oldVal) return
    await this.updateChannel(val.path)
    this.handleCloseDrawer()
    let mainScroll = this.$refs['mainScroll'] as Vue
    mainScroll.$el.scrollTop = 0
    let pageSetting = dataNodeProxy(this.selectedChannel.children ?? []).find({ route: this.$route.path })
    this.pageSetting = pageSetting ?? {}
  }

  @Watch('selectedChannel')
  async onSelectedChannel (val: Channel.DataNode, oldVal: Channel.DataNode) {
    if (val === oldVal) return
    let pageSetting = dataNodeProxy(val.children ?? []).find({ route: this.$route.path })
    this.pageSetting = pageSetting ?? {}
  }

  @Watch('auth')
  onAuthChange (val: UserDocument, oldVal: UserDocument) {
    if (val === oldVal) return
    this.env.auth = val
    if (val) {
      let { level } = val.group
      this.platform = level >= 9000 ? null : getUserArrayInfo(val, 'platform').concat(this.accountOptions?.platform)
      this.access = level >= 9000 ? null : getUserArrayInfo(val, 'access')
    }
    else {
      this.platform = null
      this.access = null
    }
  }

  @Watch('unread')
  onUnreadChange (val: number, oldVal: number) {
    if (val === oldVal) return
    let node = dataNodeProxy(this.channels)
    if (this.dashboard.notification) {
      node.update(this.dashboard.notification, { tag: val > 0 ? String(val) : '' })
    }
    this.$store.commit(this.types.setting.CHANNELS, get(node, 'data'))
  }

  handleVisible (visible: boolean) {
    this.visible = visible
  }

  handleCollapse () {
    this.collapse = !this.collapse
  }

  handleEditMode (value: boolean) {
    this.editMode = value
  }

  handleCloseDrawer () {
    this.drawerVisible = false
    this.drawerType = ''
  }

  /**
   * 更新频道
   */
  async updateChannel (routePath: string) {
    let channelId = getChannelKey(this.channels, routePath, 'route')
    if (channelId === this.selectedChannel?.key) return
    await this.selectChannel(channelId ?? '0')
    this.collapse = false
  }

  getChannelData () {
    let { key, name, route, children } = this.selectedChannel
    if (!key) return []
    return [
      {
        key: `${key}-index`,
        name: '概览',
        route,
        maps: [
          { key, name },
          { key: `${key}-index`, name: '概览' }
        ]
      },
      ...(children ?? []).filter( item => item.route !== route )
    ]
  }

  /**
   * 路由跳转
   */
  handleRouteTo (item: Channel.DataNode) {
    if (item.route) {
      this.$router.push(item.index ?? item.route)
    }
  }

  /**
   * 运行指令集
   */
  handleCommand (value: string, row?: Record<string, any>) {
    return runCommand(this, {
      fullscreen: () => {
        this.toggleFullScreen()
      },
      channels: () => {
        this.drawerVisible = true
        this.drawerType = 'channels'
      },
      refresh: () => {
        this.$store.commit(Types.setting.REFRESH, true)
      },
      logout: () => {
        this.logout()
      },
      update: () => {
        this.handleRefreshAuth()
      }
    })(value, row)
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

  /**
   * 登出
   */
  logout () {
    setTimeout(async () => {
      try {
        let result = await this.$httpClient({ token: this.token }).get<HttpResult<{ result: boolean }>>('/api/account/logout')
        if (result?.data?.result) {
          this.$store.commit(Types.auth.AUTH, null)
          this.$router.push(`/login?url_callback=${this.$route.path}`)
          return
        }
      } catch (error) {
        this.$notify.error({ title: '错误', message: get(error, 'message') })
      }
    }, 300)
  }

  /**
   * 刷新用户信息
   */
  async handleRefreshAuth () {
    try {
      let result = await this.$httpClient({ token: this.token }).GET<HttpResult<UserDocument>>('/api/account/accesstoken')
      if (result?.error) {
        this.$message.error(result.error)
      }
      else {
        if (!isEqual(this.auth, result?.data)) {
          this.$store.commit(this.types.auth.AUTH, result?.data)
        }
      }
    } catch (error) {
      this.$message.error(get(error, 'message'))
    }
  }
  
}
</script>