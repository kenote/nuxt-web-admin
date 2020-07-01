<template>
  <dashboard-page v-loading="initinal">
    <!-- 创建用户组 -->
    <dashboard-form v-if="mode === 'create'"
      name="创建团队"
      :default-values="{ level: 1000 }"
      :rules="{
        name: [
          { required: true, message: '请输入团队名称' }
        ]
      }"
      :columns="[
        {
          key: 'name',
          name: '团队名称',
          type: 'input',
          placeholder: '请输入团队名称'
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
    <!-- 编辑团队 -->
    <dashboard-form v-else-if="mode === 'edit'"
      name="编辑团队"
      :default-values="getEditDefaultValues()"
      :rules="{
        name: [
          { required: true, message: '请输入团队名称' }
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
          key: 'description',
          name: '描 述',
          type: 'textarea',
          placeholder: '请输入内容'
        }
      ]"
      @submit="handleEdit"
      @goback="handleGoback"
      :loading="loading" />
    <!-- 设置团队频道 -->
    <dashboard-platform v-else-if="mode === 'platform'"
      type="team"
      :channels="channels"
      :name="oc(selected).name('')"
      :data="oc(selected).platform([])"
      @submit="handlePlatform"
      @goback="handleGoback"
      :loading="loading" />
    <!-- 设置团队权限 -->
    <dashboard-access v-else-if="mode === 'access'"
      type="team"
      :channels="openChannels()"
      :name="oc(selected).name('')"
      :data="oc(selected).access([])"
      @submit="handleAccess"
      @goback="handleGoback"
      :loading="loading" />
    <!-- 设置团队成员 -->
    <dashboard-people v-else-if="mode === 'people'"
      :name="oc(selected).name('')"
      :auth-level="authLevel"
      :flag="flag"
      @getlist="handlePeopleList"
      @search="handleSearchPeoples"
      @submit="handleSetPeoples"
      @remove="handleRemovePeople"
      @goback="handleGoback"
      :loading="loading" />
    <!-- 团队列表 -->
    <dashboard-table v-else
      :columns="pageSetting.columns"
      :search-options="pageSetting.search"
      :data="list"
      :auth-level="authLevel"
      :flag="flag"
      :footer-bar="true"
      @getdata="handleList"
      @command="handleCommand"
      :loading="loading" >
      <el-button type="primary" @click="mode = 'create'" :disabled="authLevel < oc(flag).create(0)">创建团队</el-button>
    </dashboard-table>
  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, Provide, mixins } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { ResponseTeamDocument } from '@/types/proxys/team'
import * as api from '~/api'
import * as Ucenter from '@/types/apis/ucenter'
import { oc } from 'ts-optchain'
import { Channel } from '@/types/channel'
import { ResponseUserDocument } from '@/types/proxys/user'

type ModeType = 'list' | 'create' | 'edit' | 'platform' | 'access' | 'people'

@Component<TeamPage>({
  name: 'team-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class TeamPage extends mixins(PageMixin) {
  
  @Provide() list: ResponseTeamDocument[] = []
  @Provide() mode: ModeType = 'list'
  @Provide() selected: ResponseTeamDocument | null = null

  handleList (): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.teamList(null, this.httpOptions)
        if (result.error === 0) {
          this.list = result.data as ResponseTeamDocument[]
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

  handleCommand (type: string, row: ResponseTeamDocument): void {

    if (['edit', 'platform', 'access', 'people'].includes(type)) {
      this.mode = (type as ModeType)
      this.selected = row
    }
    else if (type === 'delete') {
      this.handleRemove(row._id)
    }
  }

  handleCreate (values: Ucenter.createTeam): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.createTeam(values, this.httpOptions)
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

  handleEdit (values: Ucenter.createTeam): void {
    let _id = oc(this.selected)._id()!
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.editTeam(_id, values, this.httpOptions)
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
        let result = await api.platformTeam(_id, values, this.httpOptions)
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
        let result = await api.accessTeam(_id, values, this.httpOptions)
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

  handlePeopleList (next: (peoples: ResponseUserDocument[]) => void): void {
    let _id = oc(this.selected)._id()!
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.peopleList(_id, this.httpOptions)
        if (result.error === 0) {
          next(result.data as ResponseUserDocument[])
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

  handleSearchPeoples (keywords: string,  next: (peoples: ResponseUserDocument[]) => void): void {
    let _id = oc(this.selected)._id()!
    setTimeout(async () => {
      try {
        let result = await api.inviteeSuggestions(keywords, _id, this.httpOptions)
        if (result.error === 0) {
          next(result.data as ResponseUserDocument[])
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleSetPeoples (values: Ucenter.peoples, next: (date: any) => void): void {
    let _id = oc(this.selected)._id()!
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.setPeople(_id, values, this.httpOptions)
        if (result.error === 0) {
          next(result.data)
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

  handleRemovePeople (values: Ucenter.peoples, next: (date: any) => void): void {
    let _id = oc(this.selected)._id()!
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.removePeople(_id, values, this.httpOptions)
        if (result.error === 0) {
          next(result.data)
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

  handleRemove (_id: string): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.removeTeam(_id, this.httpOptions)
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

  getEditDefaultValues (): Ucenter.createTeam {
    if (!this.selected) return { name: '' }
    let { name, description } = this.selected
    return { name, description }
  }

  openChannels (): Channel.element[] {
    if (!this.selected) return this.channels
    let { platform } = this.selected
    return this.channels.filter( o => platform.includes(o.id) )
  }
}
</script>