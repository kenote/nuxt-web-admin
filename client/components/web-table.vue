<template>
  <fragment>
    <el-table ref="filterTable" :data="pdata" v-loading="loading" :border="border">
      <el-table-column v-for="(column, key) in columns" :key="key"
        :label="column.name"
        :prop="column.key"
        :fixed="column.fixed"
        :width="column.width"
        :min-width="column.minWidth || 100"
        :align="column.align || 'center'">

        <template slot-scope="scope">

          <span>{{ getValues(scope.row, column.key) }}</span>
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
import { Component, Vue, Prop, Provide, Emit, Watch } from 'nuxt-property-decorator'
import { Table as ElTable } from 'element-ui'
import { DefaultSortOptions } from 'element-ui/types/table'
import { cloneDeep, orderBy, chunk, get } from 'lodash'
import { Channel } from '@/types/client'
import ruleJudgment from 'rule-judgment'

interface Conditions {
  size     ?: number
  page     ?: number
  sort     ?: string[]
}

@Component<WebTable>({
  name: 'web-table',
  created () {

  },
  mounted () {
    if (this.data) {
      this.initialData(this.data)
    }
  }
})
export default class WebTable extends Vue {
  
  @Prop({ default: undefined })
  data!: Record<string, any>[]

  @Prop({ default: false })
  loading!: boolean

  @Prop({ default: undefined })
  columns!: Channel.TableColumn[]

  @Prop({ default: false })
  border!: boolean

  @Prop({ default: 1 })
  pageno!: number

  @Prop({ default: false })
  pagination!: number | false

  @Prop({ default: -1 })
  counts!: number

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

  @Emit('get-data')
  getData (conditions: Conditions) {}

  @Emit('to-page')
  toPage (page: number) {}

  @Watch('data')
  onDataChange (val: Record<string, any>[], oldVal: Record<string, any>[]) {
    if (val === oldVal) return
    this.initialData(val)
  }

  initialData (val: Record<string, any>[]) {
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
      this.handleCurrentChange(this.pageno > pageno ? pageno : this.pageno)
    }
  }

  handleCurrentChange (page: number) {
    let pagesize = this.pagination || 10
    if (this.counts > -1) {
      if (this.current === page) return
      this.current = page
      let conditions: Conditions = { size: pagesize, page }
      if (this.sortOptions) {
        let { prop, order } = this.sortOptions
        conditions.sort = [ prop, order ]
      }
      this.getData(conditions)
      return
    }
    this.current = page
    if (this.pageno !== page) {
      this.toPage(page)
    }
    let tmpData = cloneDeep(this.data)
    if (this.sortOptions?.order) {
      let { prop, order } = this.sortOptions
      tmpData = orderBy(tmpData, [ prop ], [ order.replace(/(ending)$/, '') as 'asc' | 'desc' ])
    }
    this.total = tmpData.length
    if (this.pagination) {
      this.pdata = chunk(tmpData, pagesize)[page-1]
    }
    else {
      this.pdata = tmpData || []
    }
  }

  getValues (values: Record<string, any>, key: string) {
    let value = get(values, key)
    let filter = ruleJudgment({ key: { $eq: key } })
    let { defaultValue } = this.columns.find(filter) ?? {}
    return value ?? defaultValue
  }
}
</script>