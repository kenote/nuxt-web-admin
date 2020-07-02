<template>
  <dashboard-page v-loading="initinal">

    <!-- 用户列表 -->
    <dashboard-table 
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
      :pagination="true"
      :pagesize="oc(conditions).size(15)"
      :counts="total"
      :loading="loading" >
      <div slot="header"></div>
      <el-button @click="handleRomoveSelection" :disabled="authLevel < oc(flag).remove(0) || selection.length === 0">删除选中</el-button>
    </dashboard-table>
  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, Provide, mixins } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { ResponseUserDocument } from '@/types/proxys/user'
import * as api from '~/api'
import * as Ucenter from '@/types/apis/ucenter'
import { ListData } from 'kenote-mongoose-helper'
import { oc } from 'ts-optchain'
import { ElMessageBoxOptions } from 'element-ui/types/message-box'

type ModeType = 'list' | 'create' | 'edit'

@Component<UserPage>({
  name: 'user-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
  created () {
    this.conditions = { size: 15 }
  }
})
export default class UserPage extends mixins(PageMixin) {
  
  @Provide() list: ResponseUserDocument[] = []
  @Provide() mode: ModeType = 'list'
  @Provide() selected: ResponseUserDocument | null = null
  @Provide() selection: ResponseUserDocument[] = []
  @Provide() conditions: Ucenter.findUser | null = null
  @Provide() total: number = 0

  handleList (conditions: Ucenter.findUser): void {
    this.loading = true
    this.conditions = oc(conditions)({})
    setTimeout(async () => {
      try {
        let result = await api.userList(conditions, this.httpOptions)
        if (result.error === 0) {
          let { data, counts, limit } = result.data as ListData
          this.list = data as ResponseUserDocument[]
          this.conditions = { ...this.conditions, size: limit }
          this.total = counts as never
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

  handleSelection (selection: ResponseUserDocument[]): void {
    this.selection = selection
  }

  handleCommand (type: string, row: ResponseUserDocument): void {

    if (['edit', 'platform', 'access', 'people'].includes(type)) {
      this.mode = (type as ModeType)
      this.selected = row
    }
    else if (type === 'delete') {
      // this.handleRemove(row._id)
    }
  }

  async handleRomoveSelection (): Promise<void> {
    let options: ElMessageBoxOptions = {
      confirmButtonText    : '确定',
      cancelButtonText     : '取消',
      type                 : 'warning'
    }
    try {
      await this.$confirm('此操作将永久删除选中的用户, 是否继续?', '提示', options)
      // this.handleRemove(map(this.selection, '_id'))
    } catch (error) {
      this.$message.warning(`您已取消删除操作`)
    }
  }

  handleGoback (): void {
    this.mode = 'list'
    this.selected = null
  }
  
}
</script>