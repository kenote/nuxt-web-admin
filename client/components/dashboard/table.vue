<template>
  <fragment>
    <!-- 顶部工具栏 -->
    <slot name="header"></slot>
    <el-table ref="filterTable" :data="pdata" @sort-change="handleSortChange" @selection-change="handleSelectionChange" v-loading="loading" >
      <el-table-column v-if="selection" 
        type="selection" 
        width="40" 
        :selectable="isSelectable" />
      <el-table-column v-for="(column, key) in columns" :key="key"
        :label="column.name" 
        :prop="column.key"
        :fixed="column.fixed" 
        :width="column.width" 
        :min-width="column.minwidth || 100" 
        :sortable="column.sortable"
        :align="column.align || 'center'" >
        <template slot="header" slot-scope="scope">
          <el-input v-if="column.key === 'actions' && (searchOptions && searchOptions.field)"
            :key="scope.$index"
            v-model="search"
            size="small"
            :placeholder="`输入关键字搜索`"/>
          <span v-else :key="scope.$index">{{ column.name }}</span>
        </template>
        <template slot-scope="scope">
          <template v-if="column.emit">
            <template v-for="item in column.emit">
              <el-dropdown v-if="item.type === 'dropdown'" 
                :key="item.key" 
                size="small" 
                @command="handleCommand" 
                @click="handleEmitClick(scope.$index, item, scope.row)"
                :class="disabledRule(item.conditions, scope.row) ? '' : 'el-dropdown-disabled'"
                split-button >
                <span>{{ item.name }}</span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="opt in item.options" 
                    :key="opt.key" 
                    :command="`${opt.key}:${scope.$index}:${scope.row._id}`"
                    :disabled="!disabledRule(opt.conditions, scope.row)">
                    {{ opt.name }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <dashboard-form-item v-else-if="item.type === 'select'"
                :key="item.key"
                v-model="scope.row[column.key]"
                :column="{
                  key: item.key,
                  type: item.type,
                  data: item.options,
                  multiple: item.multiple
                }"
                @change="value => $emit('select-change', scope.row._id, item.key, value)" />
              <el-button v-else 
                :key="item.key" 
                :size="item.type === 'text' ? '' : 'small'" 
                :type="item.type" @click="handleEmitClick(scope.$index, item, scope.row)"
                :disabled="!disabledRule(item.conditions, scope.row, getFlagTag(item.key))">
                {{ item.name }}
              </el-button>
            </template>
          </template>
          <el-scrollbar v-else-if="column.tags">
            <template v-for="(item, key) in scope.row[column.key].split(column.tags.group)">
              <dashboard-tag :key="key" :data="item.split(column.tags.separator)" v-if="item" />
            </template>
          </el-scrollbar>
          <template v-else-if="oc(column).options.template()">
            <el-tooltip v-if="oc(column).options.tooltip()" :content="column.options.tooltip" placement="top">
              <span>{{ parseTemplate(oc(column).options.template(''), scope.row) }}</span>
            </el-tooltip>
            <span v-else>{{ parseTemplate(oc(column).options.template(''), scope.row) }}</span>
          </template>
          <template v-else-if="oc(column).options.status()">
            <el-tag v-if="ruleJudgment(scope.row, oc(column).options.conditions({}))" :type="oc(column).options.status[2]('danger')">{{ oc(column).options.status[0]('') }}</el-tag>
            <el-tag v-else type="successs">{{ oc(column).options.status[1]('') }}</el-tag>
          </template>
          <span v-else>{{ formatString(result(scope.row, column.key), column.format, column.default) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页条 -->
    <el-pagination v-if="pagination"
      background
      @current-change="handleCurrentChange"
      :current-page="current"
      :page-size="pagesize"
      layout="total, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    <!-- 底部操作区 -->
    <dashboard-footer-bar v-if="showFooter" :visible="showFooter">
      <slot></slot>
    </dashboard-footer-bar>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { Maps } from 'kenote-config-helper'
import { Channel } from '@/types/channel'
import { Search } from 'kenote-config-helper/types/navigation'
import { DefaultSortOptions } from 'element-ui/types/table'
import { oc } from 'ts-optchain'
import { orderBy, chunk, isObject, result, compact } from 'lodash'
import { Table as ElTable } from 'element-ui'
import { ruleJudgment } from '@/utils/query'
import { PageFlag } from '@/types/restful'
import { ElMessageBoxOptions } from 'element-ui/types/message-box'
import { formatString } from '@/utils/format'
import { parseTemplate } from '@/utils'

interface Conditions {
  size     ?: number
  page     ?: number
  sort     ?: string[]
}

@Component<DashboardTable>({
  name: 'dashboard-table',
  created () {
    this.$emit('getdata', this.counts > -1 ? { size: this.pagesize } : null)
  },
  mounted () {
    if (!this.footerOpen) return
    if (this.footerBar) {
      setTimeout(() => {
        this.showFooter = true
      }, 800)
    }
  },
  beforeDestroy () {
    this.showFooter = false
  }
})
export default class DashboardTable extends Vue {

  @Prop({ default: undefined }) data!: Maps<any>[]
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: undefined }) columns!: Channel.columns[]
  @Prop({ default: undefined }) searchOptions!: Search
  @Prop({ default: 10 }) pagesize!: number
  @Prop({ default: 1 }) pageno!: number
  @Prop({ default: false }) pagination!: boolean
  @Prop({ default: 0 }) authLevel!: number
  @Prop({ default: {} }) flag!: PageFlag.item
  @Prop({ default: false }) footerBar!: boolean
  @Prop({ default: true }) footerOpen!: boolean
  @Prop({ default: false }) selection!: boolean
  @Prop({ default: -1 }) counts!: number

  @Provide() search: string = ''
  @Provide() showFooter: boolean = false
  @Provide() pdata: Maps<any>[] = []
  @Provide() current: number = 1
  @Provide() total: number = 0
  @Provide() sort: DefaultSortOptions | undefined = undefined
  @Provide() removeEmit: Channel.columnEmit | undefined = undefined

  formatString = formatString
  parseTemplate = parseTemplate
  ruleJudgment = ruleJudgment
  oc = oc
  result = result

  @Watch('columns')
  onColumnsChange (val: Channel.columns[], oldVal: Channel.columns[]): void {
    let actionsColumn = val.find( o => o.key === 'actions' )
    if (oc(actionsColumn).emit()) {
      let columnEmit = actionsColumn?.emit?.find( o => o.key === 'delete' )
      this.removeEmit = columnEmit
    }
  }

  isSelectable (row: Maps<any>, index: number): boolean {
    if (this.removeEmit) {
      return this.disabledRule(this.removeEmit.conditions, row, 'remove')
    }
    return true
  }

  @Watch('data')
  onDataChange (val: Maps<any>[], oldVal: Maps<any>[]): void {
    if (this.counts > -1) {
      this.total = this.counts
      this.pdata = val
      this.current = this.pageno
    }
    else {
      this.total = val.length
      let theTable = this.$refs['filterTable'] as ElTable
      theTable.clearFilter()
      let pageno: number = parseInt(String((this.total + this.pagesize - 1) / this.pagesize))
      pageno = pageno || 1
      this.handleCurrentChange(this.pageno > pageno ? pageno : this.pageno)
    }
    // 
    if (!this.footerOpen) return
    setTimeout(() => {
      this.showFooter = true
    }, 800)
  }

  @Watch('search')
  onSearchChange (val: string, oldVal: string): void {
    this.handleCurrentChange(1)
  }

  handleCurrentChange (page: number): void {
    if (this.counts > -1) {
      if (this.current === page) return
      this.current = page
      let conditions: Conditions = { size: this.pagesize, page }
      if (this.sort) {
        let { prop, order } = this.sort
        conditions.sort = [ prop, order ]
      }
      this.$emit('getdata', conditions)
      return
    }
    this.current = page
    if (this.pageno !== page) {
      this.$emit('topage', page)
    }
    let _data = this.data
    if (oc(this.sort).order()) {
      let { prop, order } = oc(this.sort)() as DefaultSortOptions
      _data = orderBy(_data, [prop], [order.replace(/(ending)$/, '') as any])
    }
    try {
      _data = _data.filter( o => searchField(o, this.search, this.searchOptions.field) )
    } catch (error) {
      
    }
    this.total = _data.length
    if (this.pagination) {
      this.pdata = chunk(_data, this.pagesize)[page-1]
    }
    else {
      this.pdata = _data || []
    }
  }

  handleSortChange (column: DefaultSortOptions): void {
    let { prop, order } = column
    if (order) {
      this.sort = { prop, order }
    }
    else {
      this.sort = undefined
    }
    if (this.counts > this.pagesize) {
      let conditions: Conditions = { size: this.pagesize, page: this.current }
      if (order) {
        conditions.sort = [ prop, order ]
      }
      this.$emit('getdata', conditions)
      return
    }
    this.handleCurrentChange(this.current)
  }

  handleSelectionChange (values: Maps<any>[]): void {
    this.$emit('selection', values)
  }

  async handleEmitClick (index: number, emit: Channel.columnEmit, row: any) {
    if (!this.disabledRule(emit.conditions, row)) return
    let { confirm } = oc(emit).options({})
    if (confirm) {
      let [ message, title ] = oc(confirm)([])
      let options: ElMessageBoxOptions = {
        confirmButtonText    : '确定',
        cancelButtonText     : '取消',
        type                 : 'warning'
      }
      try {
        await this.$confirm(message, title, options)
        this.$emit('command', emit.key, row)
      } catch (error) {
        this.$message.warning(`您已取消${emit.name}`)
      }
    }
    else {
      this.$emit('command', emit.key, row)
    }
  }

  handleCommand (command: string): void {
    if (!command) return
    let [ type, index, _id ] = command.split(':')
    let row = oc(this.data)([]).find( o => o._id === _id ) as Maps<any>
    this.$emit('command', type, row)
  }

  disabledRule (rule: Maps<any>, row: Maps<any>, tag?: string) {
    if (['edit', 'remove'].includes(tag || 'edit')) {
      let result = this.authLevel < oc(this.flag)[tag || 'edit'](0)
      if (result) return !result
    }
    if (!rule) return true
    row['__authLevel'] = this.authLevel
    let r = ruleJudgment(row, rule, { $__authLevel: this.authLevel })
    return r
  }

  getFlagTag (key: string) {
    if (['remove', 'delete'].includes(key)) {
      return 'remove'
    }
    return 'edit'
  }
  
}

function searchField (obj: Maps<any>, keywords: string, field: string): boolean {
  let fields = compact(field.split(/\,/))
  let results: boolean[] = []
  for (let key of fields) {
    let _result = new RegExp(keywords).test(String(obj[key]))
    results.push(_result)
  }
  return results.includes(true)
}

</script>