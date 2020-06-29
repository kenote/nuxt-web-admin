<template>
  <fragment>
    <el-table ref="filterTable" :data="pdata" @sort-change="handleSortChange" @selection-change="handleSelectionChange" v-loading="loading" stripe>
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
              <el-button v-else 
                :key="item.key" 
                :size="item.type === 'text' ? '' : 'small'" 
                :type="item.type" @click="handleEmitClick(scope.$index, item, scope.row)"
                :disabled="!disabledRule(item.conditions, scope.row, getFlagTag(item.key))">
                {{ item.name }}
              </el-button>
            </template>
          </template>
          <span v-else>{{ scope.row[column.key] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页条 -->
    <el-pagination v-if="total > pagesize && pagination"
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
import { orderBy, chunk, isObject } from 'lodash'
import { Table as ElTable } from 'element-ui'
import { ruleJudgment } from '@/utils/query'
import { PageFlag } from '@/types/restful'
import { ElMessageBoxOptions } from 'element-ui/types/message-box'

@Component<DashboardTable>({
  name: 'dashboard-table',
  created () {
    this.$emit('getdata', null)
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

  @Provide() search: string = ''
  @Provide() showFooter: boolean = false
  @Provide() pdata: Maps<any>[] = []
  @Provide() current: number = 1
  @Provide() total: number = 0
  @Provide() sort: DefaultSortOptions | undefined = undefined

  @Watch('data')
  onDataChange (val: Maps<any>[], oldVal: Maps<any>[]): void {
    this.total = val.length
    let theTable = this.$refs['filterTable'] as ElTable
    theTable.clearFilter()
    let pageno: number = parseInt(String((val.length + this.pagesize - 1) / this.pagesize))
    pageno = pageno || 1
    this.handleCurrentChange(this.pageno > pageno ? pageno : this.pageno)
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
      _data = _data.filter( o => new RegExp(this.search).test(String(o.name)) )
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
    return ruleJudgment(row, rule)
  }

  getFlagTag (key: string) {
    if (['remove', 'delete'].includes(key)) {
      return 'remove'
    }
    return 'edit'
  }
  
}

</script>