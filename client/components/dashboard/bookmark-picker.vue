<template>
  <div>
    <el-dialog :title="title" :close-on-click-modal="false" :modal-append-to-body="true" :modal="false" :visible.sync="dialogVisible" @close="$emit('close')">
      <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="handleSubmit" label-width="100px">
        <el-form-item label="名称" :rules="rules.name" prop="name">
          <el-input v-model="values.name" placeholder="请输入名称" style="width: 80%" />
        </el-form-item>
        <el-form-item label="链接" :rules="rules.command" prop="command">
          <el-input v-model="values.command" placeholder="请输入链接" style="width: 80%" />
        </el-form-item>
        <el-form-item label="文件夹" label-width="100px">
          <div class="select-bookmark-folder" style="width: 80%">
            <perfect-scrollbar style="height:158px">
            <el-tree
              class="filter-tree"
              :data="folders"
              :props="{ id: 'key', label: 'name', children: 'children' }"
              default-expand-all
              node-key="id"
              :current-node-key="rootKey"
              @node-click="handleSelectFolder"
              ref="tree">
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>{{ node.label }}</span>
                <span v-if="!isCreateFolder(data)">
                  <el-button type="text" size="mini" @click="() => renameFolder(node, data)">修改</el-button>
                  <el-button type="text" size="mini" @click="() => removeFolder(node, data)">移除</el-button>
                </span>
              </span>
            </el-tree>
            </perfect-scrollbar>
          </div>
          <el-input v-model="target.name" style="width: 80%" readonly disabled />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCreateFolder" style="float:left;" :disabled="!isCreateFolder()">新文件夹</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { IBookmark, initMaps, removeMaps } from '@/utils/bookmark'
import { cloneDeep, map, last, trim } from 'lodash'
import { Bookmark } from '@/types/proxys/plan'
import * as uuid from 'uuid'
import { KeyMap, Maps, Rule } from 'kenote-config-helper'
import { ElMessageBoxOptions, MessageBoxInputData } from 'element-ui/types/message-box'
import { TreeData } from 'element-ui/types/tree'
import { Form as ElForm } from 'element-ui'

@Component<DashboardBookmarkPicker>({
  name: 'dashboard-bookmark-picker',
  created () {
    this.dialogVisible = this.visible
    this.values = { ...this.defaultValues }
  }
})
export default class DashboardBookmarkPicker extends Vue {
  
  @Prop({ default: '加入书签' }) title!: string
  @Prop({ default: false }) visible!: boolean
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: undefined }) defaultValues!: IBookmark.values
  @Prop({ default: [] }) data!: Bookmark[]

  @Provide() values: IBookmark.values = {}
  @Provide() dialogVisible: boolean = false
  @Provide() folders: Bookmark[] = []
  @Provide() rootKey: string = ''
  @Provide() target: IBookmark.target = { key: '', name: '', maps: [] }
  @Provide() editstatus: boolean = false
  @Provide() rules: Maps<Rule[]> = {
    name: [
      { required: true, message: '请输入名称' }
    ],
    command: [
      { required: true, message: '请输入链接' }
    ]
  }
  @Provide() parentKey: string = ''

  @Watch('visible')
  onVisibleChange (val: boolean, oldVal: boolean): void {
    this.dialogVisible = val
    if (val) {
      this.initData(this.data)
    }
  }

  @Watch('dialogVisible')
  onDialogVisibleChange (val: boolean, oldVal: boolean): void {
    if (val != this.visible) {
      this.$emit('visible-change', val)
    }
  }

  @Watch('defaultValues')
  onDefaultValuesChange (val: IBookmark.values, oldVal: IBookmark.values): void {
    this.values = { ...this.defaultValues }
    let { key } = this.defaultValues
    if (key) {
      let bookmarks = initMaps(cloneDeep(this.data)) 
      let { maps } = new IBookmark(bookmarks).find({ key })!
      if (maps!.length > 1) {
        let folder = maps![maps!.length - 2]
        let target = new IBookmark(this.folders).find({ key: folder.key })
        this.parentKey = folder.key
        this.handleSelectFolder(target!)
      }
    }
    let theForm = this.$refs['theForm'] as ElForm
    theForm && theForm.resetFields()
  }

  @Watch('data')
  onDataChange (val: Bookmark[], oldVal: Bookmark[]): void {
    
  }

  initData (data: Bookmark[]): void {
    this.rootKey = uuid.v4()
    this.folders = new IBookmark(initMaps([{
      key: this.rootKey,
      name: '书签栏',
      children: cloneDeep(data)
    }])).folders()
    this.target = { key: this.folders[0].key, name: this.folders[0].name, maps: [{ key: this.folders[0].key, name: this.folders[0].name }] }
  }

  handleSelectFolder (value: Bookmark): void {
    if (this.editstatus) return
    let folders = cloneDeep(this.folders)
    let { maps, key } = value
    if (!new IBookmark(folders).find({ key })) return
    this.target = { ...value, name: map(maps, 'name').join(' / ') }
  }

  isCreateFolder (data?: Bookmark): boolean {
    if (data) {
      if (data.key === this.rootKey) return true
      return !!new IBookmark(this.data).find({ key: data.key })
    }
    if (this.target.key === this.rootKey) return true
    return !!new IBookmark(this.data).find({ key: this.target.key })
  }

  async renameFolder (node: TreeData, data: Bookmark): Promise<void> {
    this.editstatus = true
    let { key, name, maps } = data
    let folders = cloneDeep(this.folders)
    try {
      let options: ElMessageBoxOptions = {
        confirmButtonText: '确定', 
        cancelButtonText: '取消',
        inputValue: name,
        inputPlaceholder: '设置文件夹名称'
      }
      let result = await this.$prompt(`文件夹名称`, ``, options) as MessageBoxInputData
      let item = new IBookmark(folders).find({ key })!
      item.name = result.value
      this.folders = initMaps(folders)
      this.editstatus = false
      if (this.target.key === key) {
        this.handleSelectFolder(new IBookmark(this.folders).find({ key })!)
      }
    } catch (error) {
      this.$message({ type: 'info', message: '取消输入' })
    }
  }

  removeFolder (node: TreeData, data: Bookmark): void {
    this.editstatus = true
    let { key, maps } = data
    let folders = cloneDeep(this.folders)
    new IBookmark(folders).remove(key)
    this.folders = folders
    this.editstatus = false
    if (this.target.key != key) return
    setTimeout(() => {
      let item = maps![maps!.length - 2]
      let itemMaps = maps!.slice(0, maps!.length - 1)
      this.handleSelectFolder({ key: item.key, name: item.name, maps: itemMaps })
    }, 300)
  }

  async handleCreateFolder (): Promise<void> {
    let { key } = this.target
    let folders = cloneDeep(this.folders)
    try {
      let options: ElMessageBoxOptions = {
        confirmButtonText: '确定', 
        cancelButtonText: '取消',
        inputValue: '新文件夹',
        inputPlaceholder: '设置文件夹名称'
      }
      let result = await this.$prompt(`文件夹名称`, ``, options) as MessageBoxInputData
      let uuidKey = uuid.v4()
      new IBookmark(folders).add(key, { key: uuidKey, name: result.value, children: [] })
      this.folders = initMaps(folders)
      this.handleSelectFolder(new IBookmark(this.folders).find({ key: uuidKey })!)
    } catch (error) {
      this.$message({ type: 'info', message: '取消输入' })
    }
  }

  handleSubmit (): void {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate(valid => {
      if (valid) {
        this.$emit('submit', this.getOutputValue())
      }
      else {
        return false
      }
    })
  }

  getOutputValue (): Bookmark[] {
    let data = cloneDeep(this.data)
    let targetName = last(this.target.name.split(' / '))
    let item: Bookmark = {
      key: this.values.key || uuid.v4(),
      name: this.values.name!,
      command: this.values.command
    }
    //
    if (this.values.key && this.parentKey === this.target.key) {
      new IBookmark(data).update(this.values.key!, item)
    }
    else {
      this.values.key && new IBookmark(data).remove(this.values.key!)
    // 
      if (this.target.key === this.rootKey) {
        data.push(item)
      }
      else {
        let folder = new IBookmark(data).find({ key: this.target.key })
        if (folder) {
          new IBookmark(data).add(this.target.key, item)
        }
        else {
          let targetKeys = map(this.target.maps, 'key')
          let targetKey = targetKeys[targetKeys.length - 2]
          item = {
            key: this.target.key,
            name: targetName!,
            children: [
              { ...item }
            ]
          }
          if (targetKey === this.rootKey) {
            data.push(item)
          }
          else {
            new IBookmark(data).add(targetKey, item)
          }
        }
      }
    }
    return removeMaps(data)
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