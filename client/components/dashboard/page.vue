<template>
  <page>
    <client-only placeholder="Page Loading...">
      <dashboard-breadcrumb :route-path="$route.path" :channel="selectedChannel" />
      <slot></slot>
      <div class="dashboard-fixed-tools">
        <el-button type="info" icon="el-icon-message" circle></el-button>
        <el-button v-if="bookmark" type="danger" icon="el-icon-star-off" @click="removeBookmark" circle></el-button>
        <el-button v-else type="warning" icon="el-icon-star-off" @click="addBookmarkDialog" circle></el-button>
      </div>
      <el-backtop target=".dashboard-page" :visibility-height="60" :bottom="100" :right="20"></el-backtop>
      <dashboard-bookmark-picker
        title="加入书签"
        :default-values="defaultValues"
        :data="bookmarks"
        :visible="dialogBookmarkVisible"
        @submit="handleUpdateBookmark"
        @close="handleBookmarkDialog"
        @visible-change="handleBookmarkVisible"
        :loading="loading" />
    </client-only>
  </page>
</template>

<script lang="tsx">
import { Component, Vue, mixins, Provide, Watch } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { Channel } from '@/types/channel'
import { Bookmark } from '@/types/proxys/plan'
import { Navigation, Channel as IChannel } from 'kenote-config-helper'
import { map, cloneDeep, remove, isEqual } from 'lodash'
import uuid from 'uuid'
import * as yaml from 'js-yaml'
import * as api from '~/api'
import * as auth from '~/store/modules/auth'
import ComponentMixin from '~/mixins/component'
import * as qs from 'query-string'
import { ElMessageBoxOptions, MessageBoxInputData } from 'element-ui/types/message-box'
import { Route } from 'vue-router'
import { Tree as ElTree } from 'element-ui'
import { IBookmark } from '@/utils/bookmark'

@Component<DashboardPage>({
  name: 'dashboard-page',
  created () {
    this.bookmark = new IBookmark(this.bookmarks).find({ command: `router:${this.$route.fullPath}`}) || null
  }
})
export default class DashboardPage extends mixins(ComponentMixin) {
  
  @Store.Setting.Getter selectedChannel!: Channel.element
  @Store.Auth.State bookmarks!: Bookmark[]

  @Provide() bookmark: Bookmark | null = null
  @Provide() dialogBookmarkVisible: boolean = false
  @Provide() folders: Bookmark[] = []
  @Provide() createValues: any = {
    nodeKey: ''
  }
  @Provide() loading: boolean = false
  @Provide() rootKey: string = ''
  @Provide() defaultValues: IBookmark.values = {}

  @Watch('bookmarks')
  onBookmarksChange (val: Bookmark[], oldVal: Bookmark[]): void {
    this.bookmark = new IBookmark(this.bookmarks).find({ command: `router:${this.$route.fullPath}`}) || null
    this.rootKey = uuid.v4()
    this.folders = [{
      key: this.rootKey,
      name: '书签栏',
      children: new IBookmark(this.bookmarks).folders()
    }]
  }

  @Watch('$route')
  onRouteChange (val: Route, oldVal: Route): void {
    this.bookmark = new IBookmark(this.bookmarks).find({ command: `router:${this.$route.fullPath}`}) || null
  }

  addBookmarkDialog (): void {
    this.dialogBookmarkVisible = true
    let channel = this.selectedChannel
    let nav = new IChannel(channel).find(this.$route.path)
    let title = [ channel.name, ...map(nav?.maps, 'name') ].join('/')
    this.defaultValues = {
      name: title,
      command: `router:${this.$route.fullPath}`
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
      let newBookmarks = new IBookmark(bookmarks).remove(this.bookmark?.key!)
      this.handleUpdateBookmark(newBookmarks)
    } catch (error) {
      this.$message.warning(`您已取消删除操作`)
    }
  }

  handleUpdateBookmark (content: Bookmark[]): void {
    this.loading = true
    setTimeout(async() => {
      try {
        let result = await api.getData({ method: 'post', url: '/api/v1/plan/bookmark', params: { content: yaml.dump(content) }, options: this.httpOptions })
        if (result.error === 0) {
          this.$store.commit(`${auth.name}/${auth.types.BOOKMARKS}`, result.data)
          this.handleBookmarkVisible(false)
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
      this.loading = false
    }, 300)
  }

  handleBookmarkDialog (): void {

  }

  handleBookmarkVisible (visible: boolean): void {
    this.dialogBookmarkVisible = visible
    if (!visible) {
      this.defaultValues = {}
    }
  }

  handleSelect (row) {
    console.log(row)
  }

  getPageTitle () {
    let channel = this.selectedChannel
    let nav = new IChannel(channel).find(this.$route.path)
    return [ channel.name, ...map(nav?.maps, 'name')].join('/')
  }
}

function findBookmark (bookmark: Bookmark, command: string) {
  if (bookmark.children) {
    bookmark.children.find( o => findBookmark(o, command))
  }
  else {
    return bookmark.command === command
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
  z-index: 5;
  
  * {
    margin: 0;
    margin-top: 8px;
    font-size: 16px;
  }
}

.select-bookmark-folder {
  border: 1px #dcdfe6 solid;
  height: 160px;
  overflow-y: auto;
}
  
  
</style>