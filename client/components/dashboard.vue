<template>
  <page>
    <client-only placeholder="Page Loading...">
      <slot></slot>
      <div class="page-fixed-tools" v-show="!refresh">
        <slot name="tools"></slot>
        <el-button type="info" icon="el-icon-message" circle></el-button>
        <el-button type="warning" icon="el-icon-star-off" @click="handleBookmark" circle></el-button>
      </div>
      <el-backtop target=".page-main .ps" :visibility-height="60" :bottom="100" :right="20"></el-backtop>
    </client-only>

    <bookmark-picker
      title="加入书签"
      :visible="bookmarkVisible"
      :default-values="defaultValues"
      :data="bookmarks"
      @close="handleBookmarkClose"
      @submit="handleUpdateBookmark"
      />
  </page>
</template>


<script lang="ts">
import { Component, Provide, Watch, mixins } from 'nuxt-property-decorator'
import { Channel, HttpResult, NavMenu } from '@/types/client'
import BaseMixin from '~/mixins/base'
import { Store, Types } from '~/store'
import { parseTemplate } from '@/utils'
import { BookmarkDataNode } from '@/types/services/db'
import { dataNodeProxy } from '@kenote/common'
import { Route } from 'vue-router'
import { map, get, cloneDeep } from 'lodash'
import jsYaml from 'js-yaml'
import ruleJudgment from 'rule-judgment'
import { WebSocketMessage } from '@/types/services/http'
import { ElMessageBoxOptions } from 'element-ui/types/message-box'

@Component<Dashboard>({
  name: 'dashboard',
  created () {
    let { fullPath } = this.$route
    this.bookmark = dataNodeProxy(this.bookmarks).find({ command: `router:${fullPath}` }) ?? null
  },
  mounted () {
    let wsurl = this.site_url?.replace(/^(http)/, 'ws')?.replace(/^(https)/, 'wss')
    // 订阅通知
    let pubsub  = this.dashboard.pubsub?.find(ruleJudgment({ key: 'dashboard' }))
    if (pubsub) {
      let url = parseTemplate(pubsub?.url, { wsurl })
      let socket = this.$websocket(url ?? '')
      socket.send(['notification', 'bookmark', 'draft'])
      socket.onMessage = response => {
        let { headers, body } = response as WebSocketMessage.Response
        let map = new Map()
        // 获取消息通知
        map.set('notification', () => {
          this.$store.commit(Types.auth.NOTIFICATION, body.data)
          this.$store.commit(Types.auth.UNREAD, body.counts)
        })
        // 获取用户书签
        map.set('bookmark', () => {
          this.$store.commit(Types.auth.BOOKMARKS, body.data)
        })
        // 获取用户草稿
        map.set('draft', () => {
          this.$store.commit(Types.auth.DRAFTS, body.data)
        })
        map.get(headers.path)?.call(this)
      }
    }
  }
})
export default class Dashboard extends mixins(BaseMixin) {

  @Store.Setting.State 
  dashboard!: NavMenu.Configure

  @Store.Setting.State
  refresh!: boolean

  @Store.Auth.State
  bookmarks!: BookmarkDataNode[]

  @Provide()
  bookmark: BookmarkDataNode | null = null

  @Provide()
  bookmarkVisible: boolean = false

  @Provide()
  defaultValues: Partial<BookmarkDataNode> = {}

  @Watch('$route')
  onRouteChange (val: Route, oldVal: Route) {
    if (val === oldVal) return
    let { fullPath } = val
    this.bookmark = dataNodeProxy(this.bookmarks).find({ command: `router:${fullPath}` }) ?? null
  }

  @Watch('bookmarks')
  onBookmarkChange (val: BookmarkDataNode[], oldVal: BookmarkDataNode[]) {
    if (val === oldVal) return
    let { fullPath } = this.$route
    this.bookmark = dataNodeProxy(this.bookmarks).find({ command: `router:${fullPath}` }) ?? null
  }

  async handleBookmark () {
    if (this.bookmark) {
      // 删除
      try {
        let options: ElMessageBoxOptions = {
          confirmButtonText    : '确定',
          cancelButtonText     : '取消',
          type                 : 'warning'
        }
        await this.$confirm('是否从书签中移除?', '提示', options)
        let bookmark = dataNodeProxy(cloneDeep(this.bookmarks))
        bookmark.remove(this.bookmark.key)
        this.handleUpdateBookmark(bookmark.data)
      } catch (error) {
        this.$message.warning(`您已取消删除操作`)
      }
    }
    else {
      // 添加
      this.bookmarkVisible = true
      let { fullPath, path } = this.$route
      let node = dataNodeProxy<Channel.DataNode>(this.selectedChannel.children ?? []).find({ route: path })
      this.defaultValues = {
        name: [ ...map(node?.maps, 'name') ].join('>'),
        command: `router:${fullPath}`
      }
    }
  }

  handleBookmarkClose () {
    this.bookmarkVisible = false
  }

  handleUpdateBookmark (data: BookmarkDataNode[]) {
    console.log(data)
    let httpOptions = {
      token: this.token
    }
    setTimeout(async () => {
      try {
        let result = await this.$httpClient(httpOptions).POST('/api/plan/bookmark', { content: jsYaml.dump(data) }) as HttpResult<any>
        if (result.error) {
          this.$message.error(result.error)
        }
        else {
          this.handleBookmarkClose()
        }
      } catch (error) {
        this.$message.error(get(error, 'message'))
      }
    }, 300)
  }
}
</script>

<style lang="scss" >
.page-fixed-tools {
  position: fixed;
  bottom: 150px;
  right: 20px;
  display: flex;
  flex-direction: column;
  z-index: 4;
  
  .el-button {
    margin: 0;
    margin-top: 8px;
    font-size: 16px;

    &+.el-button {
      margin-left: 0;
    }
  }
}
</style>