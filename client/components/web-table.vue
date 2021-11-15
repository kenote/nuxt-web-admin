<template>
  <fragment>
    <el-table ref="filterTable" :data="pdata" @sort-change="handleSortChange" @selection-change="selectionChange" v-loading="loading" :border="border">
      <el-table-column v-if="expand" type="expand" fixed="left" >
        <template slot-scope="props">
          <web-markdown :content="parseTemplate(expand, { ...env, row: props.row })" />
        </template>
      </el-table-column>
      <el-table-column v-if="selectionOpen" type="selection" fixed="left" width="40" :selectable=" row => !isDisabled(selectionDisabled, { row }) " />
      <el-table-column v-for="(column, key) in columns" :key="key"
        :label="column.name"
        :prop="column.key"
        :fixed="column.fixed"
        :width="column.width"
        :min-width="column.minWidth || 100"
        :sortable="column.sortable"
        :show-overflow-tooltip="true"
        :align="column.align || 'center'">
        <template slot-scope="scope">
          <template v-if="column.emit">
            <template v-for="item in column.emit">
              <el-dropdown v-if="item.type === 'dropdown'"
                :key="item.key"
                size="small"
                :class="isDisabled(item.disabled, { row: scope.row }) ? 'el-dropdown-disabled' : ''"
                :trigger="isDisabled(item.disabled, { row: scope.row }) ? '--' : 'hover'"
                @click="!isDisabled(item.disabled, { row: scope.row }) && command(item.command, scope.row)"
                @command="value => command(value, scope.row, $parent.$children[0])"
                split-button >
                <span>{{ item.name }}</span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="opt in item.options"
                    :key="opt.key"
                    :disabled="isDisabled(opt.disabled, { row: scope.row })"
                    :command="opt.command"
                    >
                    {{ opt.name }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-button v-if="item.type === 'button'" 
                :key="item.key"
                :type="item.style"
                size="small"
                :disabled="isDisabled(item.disabled, { row: scope.row })"
                @click="command(item.command, scope.row)"
                >
                {{ item.name }}
              </el-button>
              <web-form-item v-else-if="item.type === 'select'"
                :key="item.key"
                :type="item.type"
                :data="blockData(item.data || env[item.datakey], item.datablock, scope.row)"
                :props="item.props"
                :format="item.format"
                :width="item.width"
                :size="item.size"
                :multiple="item.multiple"
                :disabled="isDisabled(item.disabled, { row: scope.row })"
                :value="get(scope.row, item.valuekey || column.key)"
                @change="value => command(item.command, scope.row, { [item.valuekey || column.key]: value })"
                />
            </template>
          </template>
          <!-- 处理状态 -->
          <template v-else-if="column.status">
            <template v-for="item in column.status">
              <el-tag :key="item.key" v-if="isFilter(item.conditions, { row: scope.row })" :type="item.type">{{item.name}}</el-tag>
            </template>
          </template>
          <!-- 处理模版 -->
          <template v-else-if="column.template">
            <span :style="getAlpha(column.alpha, { row: scope.row })">{{ parseTemplate(column.template, scope.row) }}</span>
          </template>
          <!-- 可拷贝文件 -->
          <el-tooltip v-else-if="column.clipboard" content="点击复制" placement="top">
            <el-link v-clipboard="handleClipboard(getValues(scope.row, column.key))" :style="getAlpha(column.alpha, { row: scope.row })">{{ getValues(scope.row, column.key) }}</el-link>
          </el-tooltip>
          <!-- 带点击事件 -->
          <template v-else-if="column.click">
            <el-link @click="command(column.click, scope.row)" :style="getAlpha(column.alpha, { row: scope.row })">{{ getValues(scope.row, column.key) }}</el-link>
          </template>
          <!-- 处理圆点 -->
          <template v-else-if="column.dots">
            <template v-for="item in column.dots">
              <span :key="item.key" v-if="isFilter(item.conditions, { row: scope.row })" class="dot" :style="item.style">{{ item.name || '●' }}</span>
            </template>
          </template>
          <span v-else :style="getAlpha(column.alpha, { row: scope.row })">{{ getValues(scope.row, column.key) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-if="pagination"
      :current-page="current"
      :page-size="pagination"
      :total="total"
      layout="total, prev, pager, next, jumper"
      @current-change="handleCurrentChange"
      background />
  </fragment>
</template>

<script lang="ts">
import { Component, Prop, Provide, Emit, Watch, mixins } from 'nuxt-property-decorator'
import { Table as ElTable } from 'element-ui'
import { DefaultSortOptions } from 'element-ui/types/table'
import { cloneDeep, orderBy, chunk, get, merge } from 'lodash'
import { Channel } from '@/types/client'
import ruleJudgment, { FilterQuery } from 'rule-judgment'
import EnvironmentMixin from '~/mixins/environment'
import { formatString, parseTemplate, getFilter } from '@/utils'

interface Conditions {
  size     ?: number
  page     ?: number
  sort     ?: string[]
}

@Component<WebTable>({
  name: 'web-table',
  created () {
    if (this.request) {
      this.getData(this.request, null, data => {
        this.initialData(data)
      })
    }
  },
  mounted () {
    if (this.data) {
      this.initialData(this.data)
    }
  }
})
export default class WebTable extends mixins(EnvironmentMixin) {
  
  @Prop({ default: undefined })
  data!: Record<string, any>[]

  @Prop({ default: undefined })
  request!: Channel.RequestConfig

  @Prop({ default: false })
  loading!: boolean

  @Prop({ default: false })
  selectionOpen!: boolean

  @Prop({ default: undefined })
  selectionDisabled!: boolean | FilterQuery<any> | string

  @Prop({ default: undefined })
  expand!: string

  @Prop({ default: undefined })
  sorter!: Channel.Sorter

  @Prop({ default: undefined })
  columns!: Channel.TableColumn[]

  @Prop({ default: false })
  border!: boolean

  @Prop({ default: 1 })
  pageno!: number

  @Prop({ default: 15 })
  pagination!: number | false

  @Prop({ default: -1 })
  counts!: number

  @Provide()
  Idata: Record<string, any>[] = []

  @Provide()
  pdata: Record<string, any>[] = []

  @Provide()
  current: number = 1

  @Provide()
  total: number = 0

  @Provide()
  sortOptions?: DefaultSortOptions

  @Provide()
  keywords: string = ''

  parseTemplate = parseTemplate
  get = get

  @Emit('get-data')
  getData (request: Channel.RequestConfig, options: Conditions | null, next?: (data: Record<string, any>[]) => void) {}

  @Emit('to-page')
  toPage (page: number) {}

  @Emit('command')
  command (type: string, row: Record<string, any>, component?: Vue) {}

  @Emit('selection-change')
  selectionChange (values: Record<string, any>[]) {}

  @Watch('data')
  onDataChange (val: Record<string, any>[], oldVal: Record<string, any>[]) {
    if (val === oldVal) return
    this.initialData(val)
  }

  initialData (val: Record<string, any>[]) {
    this.Idata = val ?? []
    if (this.counts > -1) {
      this.total = this.counts
      this.pdata = val ?? []
      this.current = this.pageno
    }
    else {
      let theTable = this.$refs['filterTable'] as ElTable
      if (!theTable) return
      theTable.clearFilter()
      this.total = val.length
      let pagesize = this.pagination || 10
      let pageno = parseInt(String((this.total + pagesize - 1) / pagesize))
      pageno = pageno || 1
      this.handleCurrentChange(this.pageno > pageno ? pageno : this.pageno, val)
    }
  }

  refreshData () {
    if (this.request) {
      this.getData(this.request, null, data => {
        this.updateData(data)
      })
    }
  }

  updateData (val: Record<string, any>[]) {
    this.Idata = val ?? []
    if (this.counts > -1) {
      this.total = this.counts
      this.pdata = val ?? []
      this.current = this.pageno
    }
    else {
      let theTable = this.$refs['filterTable'] as ElTable
      if (!theTable) return
      theTable.clearFilter()
      this.total = val.length
      let pagesize = this.pagination || 10
      let pageno = parseInt(String((this.total + pagesize - 1) / pagesize))
      pageno = pageno || 1
      this.handleCurrentChange(this.pageno > pageno ? pageno : this.pageno, val)
    }
  }

  handleCurrentChange (page: number, data?: Record<string, any>[]) {
    let pagesize = this.pagination || 10
    if (this.counts > -1) {
      if (this.current === page) return
      this.current = page
      let conditions: Conditions = { size: pagesize, page }
      if (this.sortOptions) {
        let { prop, order } = this.sortOptions
        conditions.sort = [ prop, order ]
      }
      this.toPage(page)
      return
    }
    this.current = page
    if (this.pageno !== page) {
      this.toPage(page)
    }
    let tmpData = cloneDeep(data ?? this.Idata)
    if (this.sortOptions?.order) {
      let { prop, order } = this.sortOptions
      tmpData = orderBy(tmpData, [ prop ], [ order.replace(/(ending)$/, '') as 'asc' | 'desc' ])
    }
    this.total = tmpData.length
    if (this.pagination) {
      this.pdata = chunk(tmpData, pagesize)[page-1]
    }
    else {
      this.pdata = tmpData ?? []
    }
  }

  handleSortChange (column: DefaultSortOptions) {
    let { prop, order } = column
    this.sortOptions = order ? { prop, order } : undefined
    if (this.sorter && this.counts > (this.pagination || 15)) {
      let { request, submitOptions } = this.sorter
      // 请求远程排序
      let conditions: Conditions = { size: this.pagination || 15, page: this.current }
      if (order) {
        conditions.sort = [ prop, order ]
      }
      this.$emit('submit', conditions, request, submitOptions)
      return
    }
    this.handleCurrentChange(this.current)
  }

  getValues (values: Record<string, any>, key: string) {
    let value = get(values, key)
    let filter = ruleJudgment({ key: { $eq: key } })
    let { defaultValue, format } = this.columns.find(filter) ?? {}
    if (format) {
      // console.log(format, is)
    }
    return formatString(value, format, defaultValue)
  }

  getAlpha (conditions: FilterQuery<any> | string, scope: Record<string, any>) {
    let isFilter = this.isFilter(conditions, scope)
    return isFilter ? '' : 'opacity:.7'
  }

  /**
   * 拷贝字符串
   */
  handleClipboard (value: string) {
    return value
  }

  blockData (data: Record<string, any>[], query: FilterQuery<any> | string, row: Record<string, any>) {
    let filter = getFilter(query, { ...this.env, row })
    let tmpData: Record<string, any>[] = []
    for (let item of data) {
      if (filter(item)) {
        item.disabled = true
      }
      tmpData.push(item)
    }
    return tmpData
  }
}
</script>