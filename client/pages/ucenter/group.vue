<template>
  <page v-loading="initinal">
    <dashboard-breadcrumb :route-path="$route.path" :channel="selectedChannel" />

    <!-- 创建用户组 -->
    <dashboard-form v-if="mode === 'create'"
      name="创建用户组"
      :default-values="{ level: 1000 }"
      :rules="{
        name: [
          { required: true, message: '请输入角色名称' }
        ]
      }"
      :columns="[
        {
          key: 'name',
          name: '角色名称',
          type: 'input',
          placeholder: '请输入角色名称'
        },
        {
          key: 'level',
          name: '权 级',
          type: 'input-number',
          min: 0,
          max: 9997
        },
        {
          key: 'description',
          name: '描 述',
          type: 'textarea',
          placeholder: '请输入内容'
        }
      ]"
      @submit="handleCreate"
      @goback="mode = 'list'"
      :loading="loading" />
    <!-- 编辑用户组 -->
    <dashboard-form v-else-if="mode === 'edit'"
      name="编辑用户组"
      :default-values="getEditDefaultValues()"
      :rules="{
        name: [
          { required: true, message: '请输入角色名称' }
        ]
      }"
      :columns="[
        {
          key: 'name',
          name: '角色名称',
          type: 'input',
          placeholder: '请输入角色名称'
        },
        {
          key: 'level',
          name: '权 级',
          type: 'input-number',
          min: getMinLevel(),
          max: getMaxLevel(),
          disabled: disabledLevel()
        },
        {
          key: 'description',
          name: '描 述',
          type: 'textarea',
          placeholder: '请输入内容'
        }
      ]"
      @submit="handleEdit"
      @goback="mode = 'list'"
      :loading="loading" />
    <!-- 用户组列表 -->
    <dashboard-table v-else
      :columns="pageSetting.columns"
      :search-options="pageSetting.search"
      :data="list"
      :auth-level="authLevel"
      @getdata="handleList"
      @command="handleCommand"
      :loading="loading"
      >
      <el-button type="primary" @click="mode = 'create'">创建用户组</el-button>
    </dashboard-table>
    <!-- 删除用户组 -->
    <el-dialog title="删除用户组" :close-on-click-modal="false" :modal-append-to-body="false" :visible.sync="dialogRemoveVisible">
      <el-form v-model="removeOptions">
        <el-form-item label="组内成员" label-width="180px">
          <el-radio-group v-model="removeOptions.type" size="small">
            <el-radio :label="0" border style="margin-right:10px">删除成员</el-radio>
            <el-radio :label="1" border>移入其他组</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="移入用户组" label-width="180px">
          <el-select v-model="removeOptions.move" size="small" :disabled="removeOptions.type === 0">
            <el-option v-for="(item, key) in list" :key="key"
              :label="item.name"
              :disabled="selected === item._id || item.level >= 9000"
              :value="item._id">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.level }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogRemoveVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleRemove">确 定</el-button>
      </div>
    </el-dialog>
  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch, mixins } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { Channel } from '@/types/channel'
import PageMixin from '~/mixins/page'
import * as api from '~/api'
import { ResponseGroupDocument } from '@/types/proxys/group'
import * as Ucenter from '@/types/apis/ucenter'
import { oc } from 'ts-optchain'
import { Maps } from 'kenote-config-helper'

@Component<GroupPage>({
  name: 'group-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
  created () {
    // this.handleList()
  },
  mounted () {
    
  }
})
export default class GroupPage extends mixins(PageMixin) {

  @Store.Setting.State channels!: Channel.element[]

  @Provide() list: ResponseGroupDocument[] = []
  @Provide() mode: 'list' | 'create' | 'edit' | 'platform' | 'access' = 'list'
  @Provide() selected: ResponseGroupDocument | null = null
  @Provide() dialogRemoveVisible: boolean = false
  @Provide() removeOptions = {
    type: 0,
    move: undefined
  }

  handleList (): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.groupList(null, 'list', this.httpOptions)
        if (result.error === 0) {
          this.list = result.data as ResponseGroupDocument[]
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

  handleCommand (type: string, row: ResponseGroupDocument): void {
    console.log(type, row.name)
    switch (type) {
      case 'edit':
        this.mode = 'edit'
        this.selected = row
        break
      case 'access':

        break
      case 'platform':

        break
      case 'delete':
        this.dialogRemoveVisible = true
        this.selected = row
        break
      default:
        break
    }
  }

  handleCreate (values: Ucenter.createGroup): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.createGroup(values, this.httpOptions)
        if (result.error === 0) {
          this.mode = 'list'
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

  handleEdit (values: Ucenter.createGroup): void {
    let _id = oc(this.selected)._id()!
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.editGroup(_id, values, this.httpOptions)
        if (result.error === 0) {
          this.mode = 'list'
          this.selected = null
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

  handleRemove () {
    let _id = oc(this.selected)._id()!
    let { move } = this.removeOptions
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.removeGroup(_id, { move }, this.httpOptions)
        if (result.error === 0) {
          this.mode = 'list'
          this.selected = null
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

  getEditDefaultValues (): Ucenter.createGroup {
    if (!this.selected) return { level: 1000 }
    let { name, level, description, store } = this.selected
    let { download_type, upload_type } = store
    return { name, level, description, download_type, upload_type }
  }

  getMinLevel (): number {
    if (!this.selected) return 0
    let { level } = this.selected
    return level >= 9998 ? level : 0
  }

  getMaxLevel (): number {
    if (!this.selected) return 9997
    let { level } = this.selected
    return level >= 9998 ? level : 9997
  }

  disabledLevel (): boolean {
    if (!this.selected) return false
    let { level } = this.selected
    return level >= 9998
  }
  
}
</script>