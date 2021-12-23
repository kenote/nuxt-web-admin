<template>
  <div class="bookmarks">
    <el-input placeholder="输入关键字进行过滤" v-model="filterText" clearable></el-input>
    <perfect-scrollbar style="height:calc(100vh - 190px)" :options="{ suppressScrollX: true }">
      <el-tree ref="theTree"
        class="filter-tree"
        :data="data"
        :props="{ key: 'key', label: 'name', children: 'children' }"
        node-key="key"
        :draggable="editMode"
        @node-drop="handleDrop"
        :allow-drop="allowDrop"
        :filter-node-method="filterNode"
        @node-click="handleSelect"
        :expand-on-click-node="false"
        default-expand-all>
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
          <span v-if="editMode">
            <el-button type="text" size="mini" @click="() => handleEdit(node, data)">编辑</el-button>
            <el-button type="text" size="mini" @click="() => handleRemove(node, data)">移除</el-button>
          </span>
        </span>
      </el-tree>
    </perfect-scrollbar>
    <div class="footer">
      <el-link type="primary" :underline="false" @click="() => handleBookmark()">添加书签</el-link>
      <el-tooltip effect="dark" content="编辑模式">
        <el-switch v-model="editMode" />
      </el-tooltip>
    </div>
    <bookmark-picker
      :title="bookmarkTitle"
      :visible="bookmarkVisible"
      :default-values="defaultValues"
      :data="data"
      @close="handleBookmarkClose"
      @submit="handleUpdateBookmark"
      />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit, Provide, Prop, Watch, mixins } from 'nuxt-property-decorator'
import BaseMixin from '~/mixins/base'
import { BookmarkDataNode } from '@/types/services/db'
import { Tree as ElTree } from 'element-ui'
import { TreeNode } from 'element-ui/types/tree'
import { cloneDeep, get, nth } from 'lodash'
import jsYaml from 'js-yaml'
import { HttpResult } from '@/types/client'
import { ElMessageBoxOptions, MessageBoxInputData } from 'element-ui/types/message-box'
import { dataNodeProxy, initMaps, removeMaps } from '@kenote/common'

@Component<Bookmark>({
  name: 'bookmark'
})
export default class Bookmark extends mixins(BaseMixin) {

  @Prop({ default: undefined })
  data!: BookmarkDataNode[]

  @Prop({ default: '' })
  mode!: string

  @Provide() 
  filterText: string = ''

  @Provide() 
  editMode: boolean = false

  @Provide()
  defaultValues: Partial<BookmarkDataNode> = {}

  @Provide()
  bookmarkVisible: boolean = false

  @Provide()
  bookmarkTitle: string = '加入书签'

  @Watch('filterText')
  onFilterTextChange (val: string, oldVal: string) {
    if (val === oldVal) return
    let theTree = this.$refs['theTree'] as ElTree
    theTree.filter(val)
  }

  @Watch('editMode')
  onEditModeChange (val: boolean, oldVal: boolean) {
    if (val === oldVal) return
    this.$emit('edit-mode', val)
  }

  @Watch('mode')
  onModeChange (val: string, oldVal: string) {
    if (val === oldVal) return
    this.editMode = val === 'edit'
  }

  @Emit('command')
  command (type: string, row?: Record<string, any>, component?: Vue) {}

  filterNode (value: string, data: BookmarkDataNode) {
    if (!value) return true
    return data.name!.includes(value)
  }

  handleSelect (row: BookmarkDataNode): void {
    if (row.children || this.editMode) return
    this.$emit('command', row.command)
  }

  /**
   * 编辑节点
   */
  async handleEdit (node: TreeNode<string, BookmarkDataNode>, data: BookmarkDataNode) {
    if (data.children) {
      try {
        let options: ElMessageBoxOptions = {
          confirmButtonText: '确定', 
          cancelButtonText: '取消',
          inputValue: data.name,
          inputPlaceholder: '设置文件夹名称'
        }
        let result = await this.$prompt(`文件夹改名`, ``, options) as MessageBoxInputData
        let bookmark = dataNodeProxy(cloneDeep(this.data))
        bookmark.update(data.key, { name: result.value })
        this.handleUpdateBookmark(bookmark.data)
      } catch (error) {
        this.$message.warning(`您已取消编辑操作`)
      }
    }
    else {
      this.handleBookmark(data)
    }
  }

  /**
   * 删除节点
   */
  async handleRemove (node: TreeNode<string, BookmarkDataNode>, data: BookmarkDataNode) {
    try {
      let options: ElMessageBoxOptions = {
        confirmButtonText    : '确定',
        cancelButtonText     : '取消',
        type                 : 'warning'
      }
      await this.$confirm('是否从书签中移除?', '提示', options)
      let bookmark = dataNodeProxy(cloneDeep(this.data))
      bookmark.remove(data.key)
      this.handleUpdateBookmark(bookmark.data)
    } catch (error) {
      this.$message.warning(`您已取消删除操作`)
    }
  }

  /**
   * 打开书签编辑框
   */
  handleBookmark (data?: BookmarkDataNode) {
    if (data) {
      this.bookmarkTitle = '编辑书签'
      this.defaultValues = cloneDeep(data)
      this.bookmarkVisible = true
    }
    else {
      this.bookmarkTitle = '加入书签'
      this.defaultValues = {}
      this.bookmarkVisible = true
      this.editMode = true
    }
  }

  /**
   * 关闭书签编辑框
   */
  handleBookmarkClose () {
    this.bookmarkVisible = false
  }

  /**
   * 节点拖拽操作
   */
  handleDrop (draggingNode: TreeNode<string, BookmarkDataNode>, dropNode: TreeNode<string, BookmarkDataNode>, dropType: 'before' | 'after' | 'inner', evt: DragEvent) {
    let bookmark = dataNodeProxy(initMaps(cloneDeep(this.data)))
    let itemNode = bookmark.find({ key: draggingNode.data.key })
    let targetNode = bookmark.find({ key: dropNode.data.key })
    if (!itemNode || !targetNode) return
    bookmark.remove(itemNode.key)
    let parent = nth(targetNode?.maps, -2)
    let items = parent ? bookmark.find({ key: parent?.key })?.children ?? [] : bookmark.data
    let index = items.findIndex( r => r.key === targetNode?.key )
    if (dropType === 'before') {
      items.splice(index, 0, itemNode)
    }
    else if (dropType === 'after') {
      items.splice(index + 1, 0, itemNode)
    }
    else if (dropType === 'inner') {
      bookmark.add(targetNode.key, itemNode)
    }
    this.handleUpdateBookmark(removeMaps(bookmark.data))
  }

  /**
   * 拖拽时判定目标节点能否被放置
   */
  allowDrop(draggingNode: TreeNode<string, BookmarkDataNode>, dropNode: TreeNode<string, BookmarkDataNode>, dropType: 'prev' | 'inner' | 'next') {
    if (dropType === 'inner') {
      return !dropNode.data.command
    }
    return true
  }

  /**
   * 更新书签数据
   */
  handleUpdateBookmark (data: BookmarkDataNode[]) {
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
.bookmarks {
  margin: 20px;

  .el-input {
    margin-bottom: 15px;
  }

  .footer {
    margin-top: 10px;
    height: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    a {
      margin-left: 8px;

      &:hover {
        text-decoration: none;
      }

      &.icon {
        color: #a8abb1;
        font-size: 20px;

        &:hover {
          color: #DCDFE6;
        }
      }
    }
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
  }
}
</style>