<template>
  <dashboard-page v-loading="initinal">
    <!-- 创建用户组 -->
    <dashboard-form v-if="mode === 'create'"
      name="创建邀请码"
      :default-values="{ stint: 1, last_at: new Date(new Date().setDate(new Date().getDate() + 1)) }"
      :rules="{
        group: [
          { required: true, message: '请选择用户组/角色' }
        ]
      }"
      :columns="[
        {
          key: 'group',
          name: '用户组/角色',
          type: 'select',
          placeholder: '请选择用户组/角色',
          api: {
            method: 'post',
            url: '/api/v1/ucenter/group/lite',
            params: {},
            props: { key: '_id', name: '[{{ level }}] {{ name }}' }
          },
        },
        {
          key: 'stint',
          name: '最大使用数量',
          type: 'input-number',
          min: 1,
          max: 9999
        },
        {
          key: 'last_at',
          name: '过期时间',
          type: 'date-picker',
          mode: 'datetime',
          placeholder: '选择日期时间'
        }
      ]"
      @get-data="handleGetData"
      @submit="handleCreate"
      @goback="handleGoback"
      :loading="loading" />
    <!-- 邀请码列表 -->
    <dashboard-table v-else
      :columns="pageSetting.columns"
      :search-options="pageSetting.search"
      :data="list"
      :auth-level="authLevel"
      :flag="flag"
      :footer-bar="true"
      :selection="true"
      @selection="handleSelection"
      @getdata="handleList"
      @command="handleCommand"
      :loading="loading" >
      <el-button type="primary" @click="mode = 'create'" :disabled="authLevel < oc(flag).create(0)">创建邀请码</el-button>
      <el-button @click="handleRomoveSelection" :disabled="authLevel < oc(flag).remove(0) || selection.length === 0">删除选中</el-button>
    </dashboard-table>
  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, Provide, mixins } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { ResponseTicketDocument } from '@/types/proxys/ticket'
import * as api from '~/api'
import * as Ucenter from '@/types/apis/ucenter'
import { Maps } from 'kenote-config-helper'
import { Channel } from '@/types/channel'
import * as nunjucks from 'nunjucks'
import { ElMessageBoxOptions } from 'element-ui/types/message-box'
import { map } from 'lodash'
import { parseProps } from '@/utils'

type ModeType = 'list' | 'create' | 'edit'

@Component<TicketPage>({
  name: 'ticket-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class TicketPage extends mixins(PageMixin) {
  
  @Provide() list: ResponseTicketDocument[] = []
  @Provide() mode: ModeType = 'list'
  @Provide() selected: ResponseTicketDocument | null = null
  @Provide() selection: ResponseTicketDocument[] = []

  handleList (): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.ticketList(null, this.httpOptions)
        if (result.error === 0) {
          this.list = result.data as ResponseTicketDocument[]
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

  handleSelection (selection: ResponseTicketDocument[]): void {
    this.selection = selection
  }

  handleCommand (type: string, row: ResponseTicketDocument): void {

    if (['edit', 'platform', 'access', 'people'].includes(type)) {
      this.mode = (type as ModeType)
      this.selected = row
    }
    else if (type === 'delete') {
      this.handleRemove(row._id)
    }
  }

  handleGetData (fetch: Channel.api, next: (data: Maps<any>[]) => void): void {
    fetch.options = this.httpOptions
    setTimeout(async () => {
      try {
        let result = await api.getData(fetch)
        if (result.error === 0) {
          let data = result.data.map( o => parseProps(o, fetch.props))
          next(data)
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleCreate (values: Ucenter.createTicket): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.createTicket(values, this.httpOptions)
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

  async handleRomoveSelection (): Promise<void> {
    let options: ElMessageBoxOptions = {
      confirmButtonText    : '确定',
      cancelButtonText     : '取消',
      type                 : 'warning'
    }
    try {
      await this.$confirm('此操作将永久删除选中邀请码, 是否继续?', '提示', options)
      this.handleRemove(map(this.selection, '_id'))
    } catch (error) {
      this.$message.warning(`您已取消删除操作`)
    }
  }

  handleRemove (_id: string | string[]): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.removeTicket(_id, this.httpOptions)
        if (result.error === 0) {
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
  
}
</script>