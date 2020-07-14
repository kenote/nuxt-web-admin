<template>
  <dashboard-page v-loading="initinal">
    <!-- 主屏 -->
    <dashboard-screen :projects="projectChannels" :tag="projectTag" :footer-open="mode === 'list'" @change="handleProjectChange">

      <!-- 配置表 -->
      <dashboard-table 
        :columns="[
          {
            key: 'id',
            name: 'ID',
            width: 80,
            fixed: 'left',
            sortable: true
          },
          {
            key: 'name',
            name: '团队名称',
            width: 180,
            align: 'left'
          },
          {
            key: 'rtsps',
            name: '线路',
            width: 240,
            align: 'left',
            emit: [
              {
                key: 'rtsps',
                name: '线路',
                type: 'select',
                options: getRtsps(),
                multiple: true
              }
            ]
          },
          {},
          {
            key: 'actions',
            name: '',
            width: 240
          }
        ]"
        :search-options="{ field: 'name' }"
        :data="list"
        :auth-level="authLevel"
        :flag="flag"
        :pagination="true"
        :pagesize="15"
        @getdata="handleList"
        @select-change="handleSelectChange"
        :loading="loading" />
    </dashboard-screen>
  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, mixins, Provide, Watch } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import * as api from '~/api'
import { Maps, KeyMap } from 'kenote-config-helper'
import { ResponseTeamDocument } from '@/types/proxys/team'
import { oc } from 'ts-optchain'
import { result as _Result } from 'lodash'
import { Store } from '~/store'

type ModeType = 'list' | 'import'

@Component<SettingProjectRtspPage>({
  name: 'setting-project-rtsp-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class SettingProjectRtspPage extends mixins(PageMixin) {

  @Store.Setting.State rtsps!: Maps<string[]>
  
  @Provide() projectTag: string = ''
  @Provide() mode: ModeType = 'list'
  @Provide() list: ResponseTeamDocument[] = []

  @Watch('projectTag')
  onProjectTagChange (val: string, oldVal: string): void {
    this.mode = 'list'
  }

  handleProjectChange (value: string): void {
    this.projectTag = value
  }

  handleList (): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.teamList(this.projectTag, this.httpOptions)
        if (result.error === 0) {
          this.list = oc(result).data([]).map( o => ({ ...o, rtsps: _Result(o.rtsps, this.projectTag) || [] }))
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

  handleSelectChange (_id: string, key: string, value: string[]): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.rtspsTeam(_id, { channel: this.projectTag, rtsps: value }, this.httpOptions)
        if (result.error === 0) {
          this.$message.success(`线路分配已更新！`)
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

  getRtsps (): KeyMap<string>[] {
    return oc(this.rtsps)[this.projectTag]([]).map( o => ({ key: o, name: o }))
  }
  
}
</script>