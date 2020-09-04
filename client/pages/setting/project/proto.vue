<template>
  <dashboard-page v-loading="initinal">
    <!-- 主屏 -->
    <dashboard-screen :projects="projectChannels" :tag="projectTag" @change="handleProjectChange">
      <!-- 用户列表 -->
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
            key: 'protoname',
            name: '接口名称',
            width: 180,
            align: 'left'
          },
          {
            key: 'protocode',
            name: '接口编号',
            width: 100
          },
          {
            key: 'rstp',
            name: '请求线路',
            width: 100,
            filters: oc(rtsps)[projectTag]([]).map(parseFilter)
          },
          {
            key: 'create_at',
            name: '请求时间',
            width: 170,
            format: {
              function: 'dateFormat',
              options: [ 'YYYY-MM-DD HH:mm:ss' ]
            },
            sortable: true
          },
          {
            key: 'user.username',
            name: '操作用户',
            width: 180
          },
          {
            key: 'actions',
            name: '操作',
            minwidth: 240,
            align: 'right',
            fixed: 'right',
            emit: [
              {
                key: 'preview',
                name: '详情',
                type: 'dropdown',
                options: [
                  {
                    key: 'payload',
                    name: '请求数据'
                  },
                  {
                    key: 'response',
                    name: '返回数据'
                  }
                ]
              },
              {
                key: 'delete',
                name: '删除',
                type: 'danger',
                options: {
                  confirm: [ '此操作将永久删除该条记录, 是否继续?', '提示' ]
                },
                conditions: {
                  __authLevel: {
                    $gte: 9998
                  }
                }
              }
            ]
          },
        ]"
        :data="list"
        :auth-level="authLevel"
        :flag="flag"
        :selection="true"
        @selection="handleSelection"
        @getdata="handleList"
        @command="handleCommand"
        :pagination="true"
        :pagesize="15"
        :counts="total"
        :pageno="pageno"
        :loading="loading" >
        <dashboard-queryer ref="theQueryer" slot="header" 
          :inline="true"
          :default-values="pick(conditions, ['create_at', 'groups', 'findtype', 'findname'])"
          :rules="{
            
          }"
          :columns="[
            {
              key: 'create_at',
              name: '请求时间',
              type: 'range-picker',
              mode: 'datetimerange'
            },
            {
              key: 'user',
              name: '请求用户',
              type: 'input',
              placeholder: '用户名/邮箱/手机号',
            },
          ]"
          @submit="handleSearch"
          :loading="loading" />
      </dashboard-table>
      <!-- 底部工具条 -->
      <template slot="footer" v-if="projectTag">
        <el-button @click="handleRomoveSelection" :disabled="authLevel < oc(flag).remove(0) || selection.length === 0">删除选中</el-button>
      </template>
    </dashboard-screen>

    <!-- 全屏弹窗 -->
    <dashboard-preview-code v-if="preview.visible"
      :title="preview.title"
      :data="preview.data"
      :tag="preview.tag"
      :visible="preview.visible"
      @close="handlePreviewColse">

    </dashboard-preview-code>
  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, mixins, Provide, Watch } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import ScreenMixin from '~/mixins/screen'
import { Channel } from '@/types/channel'
import { Maps } from 'kenote-config-helper'
import { oc } from 'ts-optchain'
import { ResponseProtoDocument } from '@/types/proxys/proto'
import { pick, map } from 'lodash'
import * as api from '~/api'
import { ListData } from 'kenote-mongoose-helper'
import { ElMessageBoxOptions, MessageBoxInputData } from 'element-ui/types/message-box'
import { Store } from '~/store'
import { maxPageno } from '@/utils'

interface FindProtoLog {
  create_at     ?: Date,
  user          ?: string
}

interface PreviewOptions {
  title         ?: string
  data          ?: PreviewData[] | string
  tag           ?: string
  visible        : boolean
}

interface PreviewData {
  key            : string
  name           : string
  content        : string
}

@Component<SettingProjectProtoPage>({
  name: 'setting-project-proto-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
  created () {
    
  }
})
export default class SettingProjectProtoPage extends mixins(PageMixin, ScreenMixin) {

  @Store.Setting.State rtsps!: Maps<string[]>
  
  @Provide() project: Channel.element | undefined
  @Provide() list: ResponseProtoDocument[] = []
  @Provide() total: number = 0
  @Provide() conditions: Maps<any> | null = null
  @Provide() selection: ResponseProtoDocument[] = []
  @Provide() preview: PreviewOptions = { visible: false }
  @Provide() pageno: number = 1

  pick = pick

  @Watch('projectTag')
  onProjectTagChange (val: string, oldVal: string): void {
    if (val === oldVal) return
    if (oldVal) {
      let theQueryer = this.$refs['theQueryer'] as any
      theQueryer.handleRest()
      this.conditions = null
      this.handleList()
    }
    this.$router.push({ path: this.$route.path, query: { t: val } })
  }

  handleSearch (values: FindProtoLog): void {
    this.handleList({ ...this.conditions, ...values, page: 1 })
  }

  handleList (conditions?: Maps<any>): void {
    this.loading = true
    this.conditions = { ...this.conditions, ...conditions }
    setTimeout(async () => {
      try {
        let result = await api.protoLogList(this.projectTag, this.conditions, this.httpOptions)
        if (result.error === 0) {
          let { data, counts, limit } = result.data as ListData
          this.list = data as ResponseProtoDocument[]
          this.conditions = { ...this.conditions, size: limit }
          let pageno: number = oc(this.conditions).page(1)
          let maxpageno = maxPageno(counts as never, limit)
          this.pageno = pageno > maxpageno ? maxpageno : pageno
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

  handleSelection (selection: ResponseProtoDocument[]): void {
    this.selection = selection
  }

  async handleCommand (type: string, row: ResponseProtoDocument): Promise<void> {
    if (['preview', 'payload', 'response'].includes(type)) {
      this.handlePreview(`数据详情 [${row.id}]`, [
        { key: 'payload', name: '请求数据', content: row.payload },
        { key: 'response', name: '返回数据',  content: row.response }
      ], type === 'preview' ? 'payload' : type)
    }
    else if (type === 'delete') {
      this.handleRemove(row._id)
    }
  }

  handleRemove (_id: string | string[]): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.removeProtoLog(_id, this.projectTag, this.httpOptions)
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

  handlePreview (title: string, data: PreviewData[] | string, tag?: string): void {
    this.preview = {
      title,
      data,
      tag,
      visible: true
    }
  }

  handlePreviewColse (): void {
    this.preview = { visible: false }
  }

  async handleRomoveSelection (): Promise<void> {
    let options: ElMessageBoxOptions = {
      confirmButtonText    : '确定',
      cancelButtonText     : '取消',
      type                 : 'warning'
    }
    try {
      await this.$confirm('此操作将永久删除选中的记录, 是否继续?', '提示', options)
      this.handleRemove(map(this.selection, '_id'))
    } catch (error) {
      this.$message.warning(`您已取消删除操作`)
    }
  }

  parseFilter (value: string | number): Record<'text' | 'value', any> {
    return { text: value, value }
  }
  
}
</script>