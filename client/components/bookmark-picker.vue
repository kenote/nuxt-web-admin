<template>
  <div>
    <el-dialog
      :title="title" 
      width="680px" 
      :visible.sync="dialogVisible" 
      :append-to-body="true"
      @close="close" >
      <section :style="bodyStyles" ref="theInput" class="page-main">
        <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="handleSubmit" label-width="100px">
          <el-form-item label="名称" :rules="rules.name" prop="name">
            <el-input v-model="values.name" placeholder="请输入名称" style="width: 80%" />
          </el-form-item>
          <el-form-item label="链接" :rules="rules.command" prop="command">
            <el-input v-model="values.command" placeholder="请输入链接" style="width: 80%"  />
          </el-form-item>
          <el-form-item label="文件夹" >
            <div class="select-bookmark-folder" style="width: 80%">
              <perfect-scrollbar style="height:158px;margin-top:0">
                <el-tree ref="theTree"
                  class="filter-tree"
                  :data="getNodeFolders(bookmark)"
                  :props="{ key: 'key', label: 'name', children: 'children' }"
                  node-key="key"
                  :current-node-key="currentKey"
                  :expand-on-click-node="false"
                  @node-click="handleSelectFolder"
                  highlight-current
                  default-expand-all >
                  <span class="custom-tree-node" slot-scope="{ node, data }">
                    <span><i class="el-icon-folder"></i> {{ node.label }}</span>
                    <span>
                      <el-button type="text" size="mini" @click="() => handleCreateFolder(node, data)">创建</el-button>
                      <el-button type="text" size="mini" @click="() => handleEditFolder(node, data)">修改</el-button>
                        
                      <template v-if="!isNewFolder(data)">
                        <el-button type="text" size="mini" @click="() => handleRemoveFolder(node, data)">移除</el-button>
                      </template>
                    </span>
                  </span>
                </el-tree>
              </perfect-scrollbar>
            </div>
          </el-form-item>
        </el-form>
      </section>

      <span slot="footer" class="dialog-footer">
        <div class="dialog-footer-left">
          <el-button @click="() => handleCreateFolder()">新建文件夹</el-button>
        </div>
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit" v-loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Emit, Watch } from 'nuxt-property-decorator'
import { Verify } from '@/types/client'
import { BookmarkDataNode } from '@/types/services/db'
import { Form as ElForm, Tree as ElTree } from 'element-ui'
import uuid from 'uuid'
import { dataNodeProxy, initMaps, removeMaps } from '@kenote/common'
import { cloneDeep, get, nth, pick } from 'lodash'
import { getNodeFolders } from '@/utils'
import { ElMessageBoxOptions, MessageBoxInputData } from 'element-ui/types/message-box'
import { TreeNode } from 'element-ui/types/tree'

interface BookmarkTargt {
  key       : string
  name      : string
  maps      : BookmarkDataNode[]
}

@Component<Bookmarkpicker>({
  name: 'bookmark-picker',
  created () {
    this.dialogVisible = this.visible
  }
})
export default class Bookmarkpicker extends Vue {
  
  @Prop({ default: '' })
  title!: string

  @Prop({ default: false })
  visible!: boolean

  @Prop({ default: false })
  loading!: boolean

  @Prop({ default: undefined })
  data!: BookmarkDataNode[]

  @Prop({ default: undefined }) 
  defaultValues!: Partial<BookmarkDataNode>

  @Provide()
  dialogVisible: boolean = false

  @Provide()
  bodyStyles: Record<string, any> = { height: '300px' }

  @Provide()
  bookmark: BookmarkDataNode[] = []

  @Provide()
  currentKey: string | null = null

  @Provide()
  target: BookmarkTargt = {
    key: '',
    name: '',
    maps: []
  }

  @Provide()
  rules: Record<string, Array<Verify.Rule>> = {
    name: [
      { required: true, message: '请输入名称' }
    ],
    command: [
      { required: true, message: '请输入链接' }
    ]
  }

  @Provide()
  values: Partial<BookmarkDataNode> = {}

  @Watch('visible')
  onVisibleChange (val: boolean, oldVal: boolean) {
    if (val === oldVal) return
    if (val) {
      this.initData()
    }
    this.dialogVisible = val
    // 如果有key值，说明是编辑节点，设定文件夹光标
    if (this.defaultValues.key) {
      let bookmark = dataNodeProxy(initMaps(this.bookmark))
      let item = bookmark.find({ key: this.defaultValues.key })
      let parent = nth(item?.maps, -2)
      setTimeout(() => {
        let theTree = this.$refs['theTree'] as ElTree
        this.$nextTick(() => {
          theTree.setCurrentKey(parent?.key) 
        })
      }, 500)
    }
  }

  @Watch('defaultValues')
  onDefaultValuesChange (val: Partial<BookmarkDataNode>, oldVal: Partial<BookmarkDataNode>) {
    if (val === oldVal) return
    this.values = val
  }

  getNodeFolders = getNodeFolders


  @Emit('close')
  close () {}

  initData () {
    let theForm = this.$refs['theForm'] as ElForm
    theForm?.resetFields()
    this.currentKey = null
    this.bookmark = cloneDeep(this.data)
  }

  /**
   * 创建目录
   */
  async handleCreateFolder (node?: TreeNode<string, BookmarkDataNode>, data?: BookmarkDataNode) {
    
    try {
      let options: ElMessageBoxOptions = {
        confirmButtonText: '确定', 
        cancelButtonText: '取消',
        inputValue: '新文件夹',
        inputPlaceholder: '设置文件夹名称'
      }
      let result = await this.$prompt(`新建文件夹`, ``, options) as MessageBoxInputData
      let uuidKey = uuid.v4()
      let bookmark = dataNodeProxy(this.bookmark)
      bookmark.add(data?.key ?? null, { key: uuidKey, name: result.value, children: [] })
      this.bookmark = initMaps(bookmark.data)
      // 切换选中状态
      let theTree = this.$refs['theTree'] as ElTree
      this.$nextTick(() => {
        theTree.setCurrentKey(uuidKey) 
      })
    } catch (error) {
      this.$message({ type: 'info', message: '取消输入' })
    }
  }

  /**
   * 编辑目录
   */
  async handleEditFolder (node?: TreeNode<string, BookmarkDataNode>, data?: BookmarkDataNode) {
    try {
      let options: ElMessageBoxOptions = {
        confirmButtonText: '确定', 
        cancelButtonText: '取消',
        inputValue: data?.name,
        inputPlaceholder: '设置文件夹名称'
      }
      let result = await this.$prompt(`文件夹名称`, ``, options) as MessageBoxInputData
      let bookmark = dataNodeProxy(this.bookmark)
      bookmark.update(data?.key!, { name: result.value })
      this.bookmark = initMaps(bookmark.data)
      // 切换选中状态
      let theTree = this.$refs['theTree'] as ElTree
      this.$nextTick(() => {
        theTree.setCurrentKey(data?.key) 
      })
    } catch (error) {
      this.$message({ type: 'info', message: '取消输入' })
    }
  }

  /**
   * 删除目录
   */
  handleRemoveFolder (node?: TreeNode<string, BookmarkDataNode>, data?: BookmarkDataNode) {
    let bookmark = dataNodeProxy(initMaps(this.bookmark))
    let item = bookmark.find({ key: data?.key })
    // 获取父节点
    let parent = nth(item?.maps, -2)
    let parentItem = bookmark.find({ key: parent?.key })
    // 获取长兄节点
    let parentChildren = getNodeFolders(parentItem ? parentItem?.children! : bookmark.data)
    let index = parentChildren?.findIndex( r => r.key === item?.key )
    let brother = get(parentChildren, index - 1)
    let brotherItem = brother?.key != item?.key ? brother : null
    // 删除节点
    bookmark.remove(item?.key!)
    this.bookmark = initMaps(bookmark.data)
    // 切换选中状态
    let theTree = this.$refs['theTree'] as ElTree
    setTimeout(() => {
      this.$nextTick(() => {
        console.log(brotherItem?.key ?? parentItem?.key)
        theTree.setCurrentKey(brotherItem?.key ?? parentItem?.key) 
      })
    }, 500)
  }

  /**
   * 判断是否新创建目录
   */
  isNewFolder (data?: BookmarkDataNode) {
    let bookmark = dataNodeProxy(this.data)
    return bookmark.find({ key: data?.key })
  }

  /**
   * 选中目录
   */
  handleSelectFolder (value: BookmarkDataNode) {
    
  }

  handleClose () {
    
    this.$emit('close')
  }

  handleSubmit () {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate(valid => {
      if (valid) {
        this.$emit('submit', this.getOutputValue())
        let theTree = this.$refs['theTree'] as ElTree
        let key = theTree.getCurrentKey()
        this.$nextTick(() => {
          theTree.setCurrentKey(key) 
        })
      }
      else {
        return false
      }
    })
  }

  /**
   * 获取输出数据
   */
  getOutputValue () {
    let theTree = this.$refs['theTree'] as ElTree
    let key = theTree.getCurrentKey()
    let bookmark = dataNodeProxy(initMaps(this.bookmark))
    if (this.values.key) {
      let item = bookmark.find({ key: this.values.key })
      let parent = nth(item?.maps, -2)
      if (key === parent?.key) {
        bookmark.update(item?.key!, pick(this.values, ['name', 'command']))
      }
      else {
        bookmark.remove(this.values.key)
        bookmark.add(key, pick(this.values, ['key', 'name', 'command']) as BookmarkDataNode)
      }
    }
    else {
      let item: BookmarkDataNode = {
        key: uuid.v4(),
        name: this.values.name ?? '',
        command: this.values.command
      }
      bookmark.add(key, item)
    }
    return removeMaps(bookmark.data)
  }
}
</script>

<style lang="scss" scoped>
.select-bookmark-folder {
  border: 1px #dcdfe6 solid;
  height: 160px;
  overflow-y: hidden;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 18px;
}
</style>