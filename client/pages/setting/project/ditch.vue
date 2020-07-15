<template>
  <dashboard-page v-loading="initinal">
    <!-- 主屏 -->
    <dashboard-screen :projects="projectChannels" :tag="projectTag" :footer-open="mode === 'list'" @change="handleProjectChange">

      <!-- 导入配置 -->
        <dashboard-xlsx-import v-if="mode === 'import'"
          :title="title"
          :options="oc(projectOptions)({})"
          @submit="handleSubmit"
          @goback="handleGoback"
          :loading="loading">

        </dashboard-xlsx-import>
      <!-- 团队列表 -->
      <dashboard-table v-else
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
            name: '名称',
            width: 180,
            align: 'left'
          },
          {
            key: 'label',
            name: '标签',
            width: 120,
            align: 'left',
            sortable: true
          },
          {
            key: 'cardinal_number',
            name: '基数',
            align: 'left',
            default: '--'
          },
          {},
          {
            key: 'actions',
            name: '',
            width: 240
          }
        ]"
        :search-options="{ field: 'name,label' }"
        :data="list"
        :auth-level="authLevel"
        :flag="flag"
        :pagination="true"
        :pagesize="15"
        @getdata="handleList"
        :loading="loading" />
      
      <!-- 底部工具条 -->
      <template slot="footer" v-if="projectTag">
        <el-button type="primary" @click="handleOpenImport" :disabled="authLevel < oc(flag).edit(0)">导入渠道</el-button>
        <el-dropdown @command="handleCommandExport" style="margin-left:10px">
          <el-button type="success">
            导出渠道<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="item in fileTypes" :key="item.key" :command="item.key">{{ item.name }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </dashboard-screen>
  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, mixins, Provide, Watch } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { ResponseDitchDocument } from '@/types/proxys/ditch'
import * as api from '~/api'
import { Channel } from '@/types/channel'
import { oc } from 'ts-optchain'
import { fileTypes, xlsxBlob } from '@/utils/xlsx'
import { Execl } from '@/types'
import { map } from 'lodash'
import { Maps } from 'kenote-config-helper'

type ModeType = 'list' | 'import'

@Component<SettingProjectDitchPage>({
  name: 'setting-project-ditch-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class SettingProjectDitchPage extends mixins(PageMixin) {
  
  @Provide() projectTag: string = ''
  @Provide() mode: ModeType = 'list'
  @Provide() list: ResponseDitchDocument[] = []
  @Provide() title: string = ''
  @Provide() project: Channel.element | undefined
  @Provide() projectName: string = ''
  @Provide() projectOptions: Maps<any> = {}

  fileTypes = fileTypes

  @Watch('projectTag')
  onProjectTagChange (val: string, oldVal: string): void {
    this.mode = 'list'
    this.project = this.projectChannels.find( o => o.label === val )
    if (this.project) {
      this.projectName = this.project.name
      this.projectOptions = oc(this.project).options({})['ditch'] as Maps<any>
    }
    if (oldVal) {
      this.handleList()
    }
  }

  handleProjectChange (value: string): void {
    this.projectTag = value
  }

  handleOpenImport (): void {
    this.mode = 'import'
    this.title = `${oc(this.project).name('')} --> 渠道`
  }

  handleGoback (): void {
    this.mode = 'list'
    this.title = ''
  }

  handleList (): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.ditchList(this.projectTag, this.httpOptions)
        if (result.error === 0) {
          this.list = result.data as ResponseDitchDocument[]
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

  handleSubmit (content: string): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.ditchUpdate(this.projectTag, content, this.httpOptions)
        if (result.error === 0) {
          this.handleGoback()
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

  handleCommandExport (bookType: Execl.BookType): void {
    let sheetName = '渠道'
    let columns: Channel.columns[] = [
      {
        key: 'label',
        name: '标签'
      },
      {
        key: 'name',
        name: '名称'
      },
    ]
    let header = map(columns, 'name')
    let data: Array<{}> = []
    for (let item of this.list) {
      let obj: {} = {}
      let keys = Object.keys(item)
      for (let k of keys) {
        if (k === 'cardinal_number') {
          let _keys = Object.keys(item[k])
          header = [ ...new Set([ ...header, ..._keys ]) ]
          for (let _k of _keys) {
            obj[_k] = item[k][_k]
          }
        }
        else {
          let c = columns.find( o => o.key === k )
          if (c) {
            obj[c.name] = item[k]
          }
        }
      }
      data.push(obj)
    }
    xlsxBlob({ sheetName, header, data, filename: `${this.projectName} -- ${sheetName}`, bookType })
  }
  
}
</script>