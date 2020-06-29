<template>
  <dashboard-page v-loading="initinal">
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
      @goback="handleGoback"
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
      @goback="handleGoback"
      :loading="loading" />
    <!-- 设置用户组频道 -->
    <dashboard-platform v-else-if="mode === 'platform'"
      type="group"
      :channels="channels"
      :name="oc(selected).name('')"
      :data="oc(selected).platform([])"
      @submit="handlePlatform"
      @goback="handleGoback"
      :loading="loading" />
    <!-- 设置用户组权限 -->
    <dashboard-access v-else-if="mode === 'access'"
      type="group"
      :channels="openChannels()"
      :name="oc(selected).name('')"
      :data="oc(selected).access([])"
      @submit="handleAccess"
      @goback="handleGoback"
      :loading="loading" />
    <!-- 用户组列表 -->
    <dashboard-table v-else
      :columns="pageSetting.columns"
      :search-options="pageSetting.search"
      :data="list"
      :auth-level="authLevel"
      :flag="flag"
      @getdata="handleList"
      @command="handleCommand"
      :loading="loading" >
      <el-button type="primary" @click="mode = 'create'" :disabled="authLevel < oc(flag).create(0)">创建用户组</el-button>
    </dashboard-table>
    <!-- 删除用户组 -->
    <el-dialog title="删除用户组" :close-on-click-modal="false" :modal-append-to-body="false" :visible.sync="dialogRemoveVisible" @close="handleRemoveDialog">
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
        <el-button type="primary" @click="handleRemove" v-loading="loading">确 定</el-button>
      </div>
    </el-dialog>
  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch, mixins } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import * as api from '~/api'
import { ResponseGroupDocument } from '@/types/proxys/group'
import * as Ucenter from '@/types/apis/ucenter'
import { oc } from 'ts-optchain'
import { Maps } from 'kenote-config-helper'
import { PageFlag } from '@/types/restful'
import { Channel } from '@/types/channel'

type ModeType = 'list' | 'create' | 'edit' | 'platform' | 'access'

@Component<GroupPage>({
  name: 'group-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
  created () {
    this.flag = this.flags[this.$route.path]
  },
  mounted () {
    
  }
})
export default class GroupPage extends mixins(PageMixin) {

  @Provide() list: ResponseGroupDocument[] = []
  @Provide() mode: ModeType = 'list'
  @Provide() selected: ResponseGroupDocument | null = null
  @Provide() dialogRemoveVisible: boolean = false
  @Provide() removeOptions = {
    type: 0,
    move: undefined
  }
  @Provide() flag: PageFlag.item = {}

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
    if (['edit', 'platform', 'access'].includes(type)) {
      this.mode = (type as ModeType)
      this.selected = row
    }
    else if (type === 'delete') {
      this.dialogRemoveVisible = true
      this.selected = row
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

  handlePlatform(values: Ucenter.platform): void {
    let _id = oc(this.selected)._id()!
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.platformGroup(_id, values, this.httpOptions)
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

  handleAccess(values: Ucenter.access): void {
    let _id = oc(this.selected)._id()!
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.accessGroup(_id, values, this.httpOptions)
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

  handleRemove (): void {
    let _id = oc(this.selected)._id()!
    let { move } = this.removeOptions
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.removeGroup(_id, { move }, this.httpOptions)
        if (result.error === 0) {
          this.dialogRemoveVisible = false
          this.selected = null
          this.handleList()
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

  handleGoback (): void {
    this.mode = 'list'
    this.selected = null
  }

  handleRemoveDialog (): void {
    this.selected = null
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

  openChannels (): Channel.element[] {
    if (!this.selected) return this.channels
    let { platform } = this.selected
    return this.channels.filter( o => platform.includes(o.id) )
  }
  
}
</script>