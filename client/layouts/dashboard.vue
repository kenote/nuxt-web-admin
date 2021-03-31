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
            @command="handleCommand" >
            <search-bar 
              v-model="search" 
              placeholder="搜索控制台" 
              :data="channels" 
              :props="{ value: 'name', key: 'key', route: 'route', description: 'description', maps: 'maps' }"
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
          <div v-if="selectedChannel.name">
            <web-sidebar v-if="selectedChannel.name" 
              :title="selectedChannel.name"
              :icon="selectedChannel.icon"
              :data="[
                {
                  key: selectedChannel.key + '-index',
                  name: '概述',
                  route: selectedChannel.route
                },
                ...selectedChannel.children
              ]"
              :default-active="$route.path"
              />
          </div>
        </div>
        <!-- 内容页面 -->
        <div class="page-main">
          <nuxt></nuxt>
        </div>
      </div>
      <!-- 频道选项 -->
      <web-drawer title="频道导航" placement="left" width="250" :visible="drawerType === 'channels'" @close="handleCloseDrawer">
        <perfect-scrollbar :options="{ suppressScrollX: true }">
          <div class="main">
            <web-list :data="(channels || []).map(parseProps({ key: 'key', name: 'name', icon: 'icon', link: 'route' }))" @command="path => path && handleCommand('router:' + path)" />
          </div>
        </perfect-scrollbar>
      </web-drawer>
      <!-- 收藏夹 -->
      <web-drawer placement="right" width="260" :lock="editMode" :visible="drawerType === 'bookmark'" @close="handleCloseDrawer">

      </web-drawer>
    </div>
  </client-only>
</template>

<script lang="ts">
import { Component, mixins, Provide, Watch } from 'nuxt-property-decorator'
import BaseMixin from '~/mixins/base'
import '~/assets/scss/dashboard/warpper.scss'
import { parseCommand } from '@/utils'
import { Store, Types } from '~/store'
import { NavMenu, Channel } from '@/types/client'
import { HttpResult } from '@/utils/http-client'
import { Route } from 'vue-router'
import { getChannelKey } from '@kenote/common'

@Component<DashboardLayout>({
  name: 'dashboard-layout',
  created () {

  },
  async mounted () {
    document.body.className = 'dashboard-body'
    await this.updateChannel(this.$route.path)
  }
})
export default class DashboardLayout extends mixins(BaseMixin) {

  @Store.Setting.State 
  dashboard!: NavMenu.Configure

  @Store.Setting.State
  loading!: Record<string, boolean>

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

  @Watch('$route')
  async onRouteChange (val: Route, oldVal: Route) {
    if (val === oldVal) return
    await this.updateChannel(val.path)
    this.handleCloseDrawer()
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

  /**
   * 路由跳转
   */
  handleRouteTo (item: Channel.DataNode) {
    if (item.route) {
      this.$router.push(item.index ?? item.route)
    }
  }

  /**
   * 指令操作
   */
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
        case 'channels':
          this.drawerVisible = true
          this.drawerType = 'channels'
          break
        case 'logout':
          this.logout()
          break
        default:
          break
      }
    }
    // 处理内部路由
    else if (command.type === 'router') {
      this.$router.push(command.path)
      this.handleCloseDrawer()
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
        this.$notify.error({ title: '错误', message: error.message })
      }
    }, 300)
  }
  
}
</script>