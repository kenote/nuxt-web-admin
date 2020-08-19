<template>
  <dashboard-page v-loading="initinal">

    <!-- 查询器 -->
    <dashboard-queryer 
      :default-values="{}"
      :rules="{
        
      }"
      :columns="oc(pageSetting).queryer([])"
      :rtsps="filterRtsps"
      :submit-options="pageSetting.submit"
      :draft="pageSetting.draft"
      @get-data="handleGetData"
      @get-plans="handleGetPlans"
      @create-plan="handleCreatePlan"
      @update-plan="handleUpdatePlan"
      @remove-plan="handleRemovePlan"
      @submit="handleSubmit"
      :loading="loading || polling" />

    <!-- 返回结果 -->

    <!-- 卡片模式 -->
    <dashboard-cards v-if="pageSetting.cards"
      :columns="pageSetting.columns"
      :data="data"
      :auth-level="authLevel"
      :teams="teams"
      :options="pageSetting.cards"
      @update-data="handleUpdateData"
      :loading="loading" >

    </dashboard-cards>
    <!-- 图表模式 -->
    <!-- <dashboard-charts v-else-if="viewMode === 'charts'"
      :data="data"
      :columns="pageSetting.columns"
      :loading="loading">
      <el-select v-model="viewMode" placeholder="请选择" style="margin-left:20px" v-if="oc(data)([]).length > 0 && viewModes.length > 1" :disabled="loading || polling">
        <el-option v-for="(item, key) in viewModes" :key="key" :label="item.name" :value="item.key"></el-option>
      </el-select>
      <dashboard-poller ref="pollTasks" 
        :tasks="pollTasks"
        :polling="polling"
        @play="playTask"
        @pause="pauseTask"
        @clean-success="cleanSuccessTask"
        @clean-all="cleanAllTask"
        @clean-item="cleanItemTask"
        />
    </dashboard-charts> -->
    <div v-else-if="messageResult" />
    <!-- 单表格模式 -->
    <dashboard-table v-else
      :columns="pageSetting.columns"
      :data="data"
      :view-mode="viewMode"
      :auth-level="authLevel"
      :flag="flag"
      :footer-bar="true"
      :pagination="pagination"
      :pagesize="15"
      :loading="loading && !pageSetting.rangeDate" >
      <el-switch v-if="viewMode != 'charts'"
        v-model="pagination"
        style="margin-top: 10px"
        inactive-text="分页"
        :disabled="loading || polling"
        />
      <el-dropdown @command="handleCommandExport" style="margin-left:20px" v-if="oc(data)([]).length > 0 && isExport()">
        <el-button type="success">
          导出文件<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="item in fileTypes" :key="item.key" :command="item.key">{{ item.name }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-select v-model="viewMode" placeholder="请选择" style="margin-left:20px" v-if="viewModes.length > 1" :disabled="loading || polling">
        <el-option v-for="(item, key) in viewModes" :key="key" :label="item.name" :value="item.key"></el-option>
      </el-select>
      <dashboard-poller ref="pollTasks" v-if="pageSetting.rangeDate"
        :tasks="pollTasks"
        :polling="polling"
        @play="playTask"
        @pause="pauseTask"
        @clean-success="cleanSuccessTask"
        @clean-all="cleanAllTask"
        @clean-item="cleanItemTask"
        />
    </dashboard-table>

  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, mixins, Provide, Watch } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import * as api from '~/api'
import { Channel } from '@/types/channel'
import { Maps, KeyMap } from 'kenote-config-helper'
import { parseProps, getRangeDateByMonth, getRangeDateByDay } from '@/utils'
import { ResponsePlanDocument, CreatePlanDocument, PlanType, EditPlanDocument } from '@/types/proxys/plan'
import * as yaml from 'js-yaml'
import { UpdateWriteResult, DeleteWriteResult } from 'kenote-mongoose-helper'
import { oc } from 'ts-optchain'
import { fileTypes, xlsxBlob } from '@/utils/xlsx'
import { Execl, Poller } from '@/types'
import { map, intersection, zipObject, isEqual, remove } from 'lodash'
import { formatStringType } from '@/utils/format'
import { Store } from '~/store'
import { getRtsps } from '@/utils/user'
import { HeaderOptions } from '@/utils/http'
import { ruleJudgment } from '@/utils/query'
import dayjs from 'dayjs'
import { RestfulInfoByError } from '@/types/restful'
import axios, { CancelTokenSource } from 'axios'
import * as uuid from 'uuid'
import { QuerySelectOption } from 'kenote-config-helper/types/queryselect'

const viewModes: Maps<string> = {
  columns    : '表格模式',
  charts     : '图表模式'
}

@Component<ProjectPage>({
  name: 'project-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
  created() {
    
  }
})
export default class ProjectPage extends mixins(PageMixin) {


  @Store.Auth.Getter teams!: string[]
  @Store.Setting.Getter rtsps!: string[]
  
  @Provide() data: any[] = []
  @Provide() pagination: boolean = true
  @Provide() filterRtsps: string[] = []
  @Provide() viewModes: KeyMap<string>[] = []
  @Provide() viewMode: string = ''
  @Provide() pollTasks: Poller.task[] = []
  @Provide() cancelTokenSource!: CancelTokenSource
  @Provide() polling: boolean = false
  @Provide() messageResult: boolean | undefined = false

  fileTypes = fileTypes

  @Watch('pageSetting')
  onPageSettingChange (val: Channel.navigation, oldVal: Channel.navigation): void {
    let s = ['Master', 'Slave']
    let rstps = getRtsps(this.auth, this.selectedChannel.label, this.rtsps, oc(val).options.rtsp())
    this.filterRtsps = JSON.parse(JSON.stringify(rstps)).sort( (a, b) => s.indexOf(a) < s.indexOf(b) ? 1: -1 )
    let modes = intersection(Object.keys(val), ['columns', 'charts'])
    this.viewModes = modes.map( key => ({ key, name: viewModes[key] }))
    this.viewMode = modes[0]
    // 
    if (val.querySelect) {
      let { default: label } = val.querySelect
      this.messageResult = this.isMessageResult(label)
    }
    else {
      this.messageResult = this.isMessageResult()
    }
  }

  @Watch('viewMode')
  onViewModeChange (val: string, oldVal: string): void {
    console.log(val)
  }

  isExport (): boolean {
    if (!this.pageSetting?.export) return false
    let { conditions } = this.pageSetting?.export
    if (conditions) {
      return ruleJudgment({ teams: this.teams, __authLevel: this.authLevel }, conditions)
    }
    return true
  }

  handleGetData (fetch: Channel.api, next: (data: Maps<any>[]) => void): void {
    fetch.options = this.httpOptions
    setTimeout(async () => {
      try {
        let result = await api.getData(fetch)
        if (result.error === 0) {
          let data = result.data.map( o => parseProps(o, fetch.props!))
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

  handleGetPlans (type: string, next: (data: ResponsePlanDocument[]) => void): void {
    setTimeout(async () => {
      try {
        let result = await api.planList(type, this.selectedChannel.label, this.httpOptions)
        if (result.error === 0) {
          next(result.data)
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleCreatePlan (type: PlanType, name: string, value: any, next: (data: ResponsePlanDocument[]) => void): void {
    let data: CreatePlanDocument = {
      type,
      name,
      content: yaml.dump(value),
      channel: this.selectedChannel.label
    }
    setTimeout(async () => {
      try {
        let result = await api.createPlan(data, this.httpOptions)
        if (result.error === 0) {
          next(result.data)
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleUpdatePlan (_id: string, name: string, value: any, next: (data: UpdateWriteResult) => void): void {
    let data: EditPlanDocument = {
      name,
      content: yaml.dump(value)
    }
    setTimeout(async () => {
      try {
        let result = await api.editPlan(_id, data, this.httpOptions)
        if (result.error === 0) {
          next(result.data)
        }
        else {
          this.$message.warning(result.message)
          next({ n: 0, nModified: 0, ok: 0 })
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleRemovePlan (_id: string, next: (data: DeleteWriteResult) => void): void {
    setTimeout(async () => {
      try {
        let result = await api.removePlan(_id, this.httpOptions)
        if (result.error === 0) {
          next(result.data)
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleSubmit (values: Maps<any>, rtsp?: string): void {
    let httpOptions: HeaderOptions = {
      ...this.httpOptions
    }
    if (rtsp) {
      httpOptions.header = { rtsp_key: rtsp }
    }
    let { rangeDate } = this.pageSetting
    if (rangeDate) {
      let { begin, end } = values as Record<'begin' | 'end', Date>
      let ranges: Date[][] = []
      if (rangeDate === 'month') {
        ranges = getRangeDateByMonth(begin, end)
      }
      if (rangeDate === 'day') {
        ranges = getRangeDateByDay(begin, end)
      }
      this.pollTasks = ranges.map( range => ({ 
        key: uuid.v4(),
        status: 'waiting', 
        name: range.map( o => dayjs(o).format('YYYY-MM-DD') ).join(' ~ '), 
        params: { ...values, ...zipObject(['begin', 'end'], range.map(toISOString)) },
        options: httpOptions 
      }))
      ranges.length > 0 && this.handlePollTasks()
      return
    }
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.protoSend(this.pageSetting.api!, values, httpOptions)
        if (result.error === 0) {
          this.data = oc(result).data['data']([])
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

  handlePollTasks (isStart: boolean = true): void {
    let poller = this.$refs['pollTasks'] as any
    let pollTasks = this.pollTasks.filter( task => task.status != 'success' )
    this.polling = true
    setTimeout(async () => {
      try {
        if (isStart) {
          this.data = []
        }
        for (let task of pollTasks) {
          if (!this.polling) break
          let start = Date.now()
          task.status = 'performed'
          await Promise.resolve(poller.update())
          let { params, options } = task
          this.cancelTokenSource = axios.CancelToken.source()
          options!.cancelToken = this.cancelTokenSource.token
          let result = await api.protoSend(this.pageSetting.api!, params!, options!)
          task.size = JSON.stringify(result.data).length
          task.time = Date.now() - start
          if (result.error === 0) {
            this.data = [ ...this.data, ...oc(result).data['data']([]) ]
            task.status = 'success'
          }
          else {
            task.status = 'failure'
          }
          await Promise.resolve(poller.update())
        }
      } catch (error) {
        
      }
      this.polling = false
    }, 300)
  }

  handleUpdateData (api: string, values: any): void {
    console.log(api, values)
  }

  handleCommandExport (bookType: Execl.BookType): void {
    
    let sheetName = this.pageSetting.export?.sheetName || this.pageSetting.name
    let columns = oc(this.pageSetting).columns([]) as Channel.columns[]
    let header = map(columns, 'name').filter( o => !!o && o != '操作')
    let data: Array<{}> = []
    for (let item of this.data) {
      let obj: {} = {}
      let keys = Object.keys(item)
      for (let k of keys) {
        let c = columns.find( o => o.key === k )
        if (c) {
          obj[c.name] = item[k]
          if (formatStringType(c.format) === 'number') {
            obj[c.name] = Number(obj[c.name].replace(/[^0-9\.]/g, ''))
          }
        }
      }
      data.push(obj)
    }
    xlsxBlob({ sheetName, header, data, filename: sheetName, bookType })
  }

  cleanAllTask (): void {
    this.pollTasks = []
  }

  cleanSuccessTask (): void {
    this.pollTasks = this.pollTasks.filter( o => o.status != 'success' )
  }

  pauseTask (): void {
    this.cancelTokenSource.cancel('用户中断了请求')
    this.polling = false
  }

  playTask (): void {
    this.handlePollTasks(false)
  }

  cleanItemTask (item: Poller.task): void {
    let poller = this.$refs['pollTasks'] as any
    remove(this.pollTasks, o => o.key === item.key)
    poller.update()
  }

  isMessageResult (label?: string): boolean {
    let { querySelect, submit } = this.pageSetting
    if (querySelect) {
      let item: QuerySelectOption | undefined = querySelect.options.find( o => o.key === label )
      return oc(item).submit.result() === 'message'
    }
    return oc(submit).result() === 'message'
  }
}

function toISOString (value?: string | number | Date): string {
  return dayjs(value).toISOString()
}
</script>