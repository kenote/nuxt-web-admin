<template>
  <page>
    <client-only placeholder="Page Loading...">
      <dashboard-breadcrumb :route-path="$route.path" :channel="selectedChannel" />
      <slot></slot>
      <div class="dashboard-fixed-tools">
        <el-button type="info" icon="el-icon-message" circle></el-button>
        <el-button v-if="bookmark" type="danger" icon="el-icon-star-off" @click="removeBookmark" circle></el-button>
        <el-button v-else type="warning" icon="el-icon-star-off" @click="addBookmark" circle></el-button>
      </div>
      <el-backtop target=".dashboard-page" :visibility-height="60" :bottom="100" :right="20"></el-backtop>
    </client-only>
  </page>
</template>

<script lang="ts">
import { Component, Vue, mixins, Provide, Watch } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { Channel } from '@/types/channel'
import { Bookmark } from '@/types/proxys/plan'
import { Navigation, Channel as IChannel } from 'kenote-config-helper'
import { map, cloneDeep, remove } from 'lodash'
import uuid from 'uuid'
import * as yaml from 'js-yaml'
import * as api from '~/api'
import * as auth from '~/store/modules/auth'
import ComponentMixin from '~/mixins/component'
import * as qs from 'query-string'
import { ElMessageBoxOptions, MessageBoxInputData } from 'element-ui/types/message-box'
import { Route } from 'vue-router'

@Component<DashboardPage>({
  name: 'dashboard-page',
  created () {
    this.bookmark = this.bookmarks.find( bookmark => bookmark.command === `router:${this.$route.fullPath}`) || null
  }
})
export default class DashboardPage extends mixins(ComponentMixin) {
  
  @Store.Setting.Getter selectedChannel!: Channel.element
  @Store.Auth.State bookmarks!: Bookmark[]

  @Provide() bookmark: Bookmark | null = null

  @Watch('bookmarks')
  onBookmarksChange (val: Bookmark[], oldVal: Bookmark[]): void {
    this.bookmark = val.find( bookmark => bookmark.command === `router:${this.$route.fullPath}`) || null
  }

  @Watch('$route')
  onRouteChange (val: Route, oldVal: Route): void {
    this.bookmark = this.bookmarks.find( bookmark => bookmark.command === `router:${val.fullPath}`) || null
  }

  async addBookmark (): Promise<void> {
    let channel = this.selectedChannel
    let nav = new IChannel(channel).find(this.$route.path)
    let title = [ channel.name, ...map(nav?.maps, 'name') ].join('/')
    let bookmarks = cloneDeep(this.bookmarks)
    try {
      let options: ElMessageBoxOptions = {
        confirmButtonText: '确定', 
        cancelButtonText: '取消',
        inputValue: title,
        inputPlaceholder: '书签名称'
      }
      let result = await this.$prompt(`书签名称`, `加入书签`, options) as MessageBoxInputData
      bookmarks.push({ key: uuid.v4(), name: result.value, command: `router:${this.$route.fullPath}` })
      this.handleUpdateBookmark(bookmarks)
    } catch (error) {
      this.$message({ type: 'info', message: '取消输入' })
    }
  }

  async removeBookmark (): Promise<void> {
    let bookmarks = cloneDeep(this.bookmarks)
    try {
      let options: ElMessageBoxOptions = {
        confirmButtonText    : '确定',
        cancelButtonText     : '取消',
        type                 : 'warning'
      }
      await this.$confirm('是否将本页从书签中移除?', '提示', options)
      remove(bookmarks, bookmark => bookmark.key === this.bookmark?.key)
      this.handleUpdateBookmark(bookmarks)
    } catch (error) {
      this.$message.warning(`您已取消删除操作`)
    }
  }

  handleUpdateBookmark (content: Bookmark[]): void {
    setTimeout(async() => {
      try {
        let result = await api.getData({ method: 'post', url: '/api/v1/plan/bookmark', params: { content: yaml.dump(content) }, options: this.httpOptions })
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

  getPageTitle () {
    let channel = this.selectedChannel
    let nav = new IChannel(channel).find(this.$route.path)
    return [ channel.name, ...map(nav?.maps, 'name')].join('/')
  }
}
</script>

<style lang="scss" scoped>
.dashboard-fixed-tools {
  position: fixed;
  bottom: 150px;
  right: 20px;
  display: flex;
  flex-direction: column;
  
  * {
    margin: 0;
    margin-top: 8px;
    font-size: 16px;
  }
}
</style>