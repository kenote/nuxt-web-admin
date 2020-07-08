<template>
  <dashboard-page v-loading="initinal">

    <dashboard-form v-if="infoUser"
      name="基本信息"
      :default-values="getEditDefaultValues()"
      :rules="{}"
      :columns="[
        {
          key: 'username',
          name: '用户名',
          type: 'input',
          placeholder: '请输入用户名称',
          disabled: true
        },
        {
          key: 'group',
          name: '用户组/角色',
          type: 'select',
          placeholder: '请选择用户组/角色',
          api: {
            method: 'post',
            url: '/api/v1/ucenter/group/list',
            params: {},
            props: { key: '_id', name: 'name' }
          },
          disabled: true
        },
        {
          key: 'nickname',
          name: '昵称',
          type: 'input',
          placeholder: '请输入昵称'
        },
        {
          key: 'sex',
          name: '性别',
          type: 'radio',
          data: [
            { key: 0, name: '未知' },
            { key: 1, name: '男' },
            { key: 2, name: '女' },
          ]
        },
        teams.length > 0 ? {
          key: 'teams',
          name: '加入的团队',
          type: 'checkbox-border',
          data: teams,
          disabled: true
        } : undefined
      ]"
      @get-data="handleGetData"
      :no-back="true"
      submit-name="保 存"
      @submit="handleSave"
      :loading="loading" />
  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, Provide, mixins, Watch } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import * as api from '~/api'
import { Maps } from 'kenote-config-helper'
import { Channel } from '@/types/channel'
import { parseProps } from '@/utils'
import { map, pick } from 'lodash'
import * as Ucenter from '@/types/apis/ucenter'
import { ResponseUserDocument } from '@/types/proxys/user'
import * as auth from '~/store/modules/auth'
import { oc } from 'ts-optchain'

@Component<BaseinfoPage>({
  name: 'baseinfo-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
  created () {
    this.handlePull()
  }
})
export default class BaseinfoPage extends mixins(PageMixin) {
  
  @Provide() teams: Maps<string>[] = []
  @Provide() infoUser: ResponseUserDocument | null = null
  @Provide() columns: Channel.queryer[] = []

  @Watch('infoUser')
  onAuthChange (val: ResponseUserDocument, oldVal: ResponseUserDocument): void {
    let { teams } = val
    this.teams = teams.map( o => parseProps(o, { key: '_id', name: 'name' }))
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

  handlePull (): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.accesstoken(this.httpOptions)
        if (result.error === 0) {
          this.$store.commit(`${auth.name}/${auth.types.AUTH}`, result.data)
          this.infoUser = result.data
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

  handleSave (values: Ucenter.createUser): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.baseInfo(values, this.httpOptions)
        if (result.error === 0) {
          this.$store.commit(`${auth.name}/${auth.types.AUTH}`, result.data)
          this.infoUser = result.data
          this.$message.success(`基本信息已更新！`)
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

  getEditDefaultValues (): Maps<any> {
    if (!this.infoUser) return {}
    let { username, group, nickname, sex, teams } = this.infoUser
    return { username, group: group._id, nickname, sex, teams: map(teams, '_id') }
  }
}
</script>