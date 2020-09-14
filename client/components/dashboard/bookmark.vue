<template>
  <div class="bookmarks">
    <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
    <perfect-scrollbar style="height:calc(100vh - 190px)" :options="{ suppressScrollX: true }">
      <el-tree
        class="filter-tree"
        :data="data"
        :props="{ id: 'key', label: 'name', children: 'children' }"
        default-expand-all
        :filter-node-method="filterNode"
        @node-click="handleSelect"
        ref="tree">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
          <span v-if="editMode">
            <el-button type="text" size="mini" @click="() => rename(node, data)">修改</el-button>
            <el-button type="text" size="mini" @click="() => remove(node, data)">删除</el-button>
          </span>
        </span>
      </el-tree>
    </perfect-scrollbar>
    <div class="footer" v-if="editMode">
      <el-link type="primary" :underline="false" @click="() => handleVisible(true, true)">添加书签</el-link>
      <el-tooltip effect="dark" content="返回书签">
        <a class="icon" @click="editMode = false"><i class="el-icon-back"></i></a>
      </el-tooltip>
    </div>
    <div class="footer" v-else>
      <span></span>
      <el-tooltip effect="dark" content="书签管理">
        <a class="icon" @click="editMode = true"><i class="el-icon-setting"></i></a>
      </el-tooltip>
    </div>
    <dashboard-bookmark-picker
      :title="defaultValues.key ? '编辑书签' : '添加书签'"
      :default-values="defaultValues"
      :data="data"
      :visible="visible"
      @submit="handleUpdate"
      @close="handleDialog"
      @visible-change="handleVisible"
      :loading="loading" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch, mixins } from 'nuxt-property-decorator'
import { Bookmark } from '@/types/proxys/plan'
import { TreeData } from 'element-ui/types/tree'
import { Tree as ElTree } from 'element-ui'
import { IBookmark, initMaps, removeMaps } from '@/utils/bookmark'
import { ElMessageBoxOptions, MessageBoxInputData } from 'element-ui/types/message-box'
import { cloneDeep } from 'lodash'
import * as yaml from 'js-yaml'
import * as api from '~/api'
import * as auth from '~/store/modules/auth'
import ComponentMixin from '~/mixins/component'

@Component<DashboardBookmark>({
  name: 'dashboard-bookmark'
})
export default class DashboardBookmark extends mixins(ComponentMixin) {
  
  @Prop({ default: [] }) data!: Bookmark[]

  @Provide() filterText: string = ''
  @Provide() editMode: boolean = false
  @Provide() defaultValues: IBookmark.values = {}
  @Provide() visible: boolean = false
  @Provide() loading: boolean = false

  @Watch('filterText')
  onFilterTextChange (val: string, oldVal: string): void {
    let tree = this.$refs['tree'] as ElTree
    tree.filter(val)
  }

  @Watch('editMode')
  onEditModeChange (val: boolean, oldVal: boolean): void {
    this.$emit('edit-mode', val)
  }

  filterNode (value: string, data: Bookmark): boolean {
    if (!value) return true
    return data.name!.indexOf(value) !== -1
  }


  handleSelect (row: Bookmark): void {
    if (row.children || this.editMode) return
    this.$emit('command', row.command)
  }

  handleDialog (): void {

  }

  handleVisible (visible: boolean, create: boolean = false): void {
    this.visible = visible
    if (!visible || create) {
      this.defaultValues = {}
    }
  }

  create (): void {
    this.visible = true
    this.defaultValues = {
      
    }
  }

  async rename (node: TreeData, data: Bookmark): Promise<void> {
    if (data.children) {
      try {
        let options: ElMessageBoxOptions = {
          confirmButtonText: '确定', 
          cancelButtonText: '取消',
          inputValue: data.name,
          inputPlaceholder: '设置文件夹名称'
        }
        let result = await this.$prompt(`文件夹改名`, ``, options) as MessageBoxInputData
        let bookmarks = cloneDeep(this.data)
        new IBookmark(bookmarks).update(data.key, { name: result.value } as never)
        this.handleUpdate(bookmarks)
      } catch (error) {
        this.$message.warning(`您已取消删除操作`)
      }
      return
    }
    this.visible = true
    this.defaultValues = {
      key: data.key,
      name: data.name,
      command: data.command
    }
  }

  async remove (node: TreeData, data: Bookmark): Promise<void> {
    let bookmarks = cloneDeep(this.data)
    try {
      let options: ElMessageBoxOptions = {
        confirmButtonText    : '确定',
        cancelButtonText     : '取消',
        type                 : 'warning'
      }
      await this.$confirm('是否从书签中移除?', '提示', options)
      new IBookmark(bookmarks).remove(data.key)
      this.handleUpdate(bookmarks)
    } catch (error) {
      this.$message.warning(`您已取消删除操作`)
    }
  }

  handleUpdate (content: Bookmark[]): void {
    this.loading = true
    setTimeout(async() => {
      try {
        let result = await api.getData({ method: 'post', url: '/api/v1/plan/bookmark', params: { content: yaml.dump(content) }, options: this.httpOptions })
        if (result.error === 0) {
          this.$store.commit(`${auth.name}/${auth.types.BOOKMARKS}`, result.data)
          this.handleVisible(false)
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
}
</script>

<style lang="scss" scoped>
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
    padding-right: 18px;
  }
}
</style>