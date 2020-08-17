<template>
  <fragment>
    <el-radio-group v-model="chartSettings.type" size="mini">
      <el-radio-button v-for="(type) in typeMap" :key="type.key" :label="type.key" >{{ type.name }}</el-radio-button>
    </el-radio-group>
    <ve-chart
      :set-option-opts="false"
      :data="chartData" 
      :data-zoom="chartDataZoom" 
      :settings="chartSettings"
      />
    <!-- 底部操作区 -->
    <dashboard-footer-bar v-if="showFooter" :visible="showFooter">
      <slot></slot>
    </dashboard-footer-bar>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import 'echarts/lib/component/dataZoom'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/markLine'
import { Channel } from '@/types/channel'
import { KeyMap, Maps } from 'kenote-config-helper'
import { map, zipObject } from 'lodash'
import veChart from 'v-charts/lib/chart'
import veLine from 'v-charts/lib/line'
import veHistogram from 'v-charts/lib/histogram'
import { formatString } from '@/utils/format'

@Component<DashboardCharts>({
  name: 'dashboard-charts',
  components: {
    veChart,
    veLine,
    veHistogram
  },

  mounted () {
    if (this.data.length > 0) {
      this.chartData = {
        columns: map(this.columns, 'name'),
        rows: this.data.map(this.parseData).map(this.parseRow)
      }
    }
    setTimeout(() => {
      this.showFooter = true
    }, 500)
  },
  beforeDestroy () {
    this.showFooter = false
  }
})
export default class DashboardCharts extends Vue {

  @Prop({ default: false }) loading!: boolean
  @Prop({ default: [] }) data!: Maps<any>[]
  @Prop({ default: undefined }) columns!: Channel.columns[]
  @Prop({ default: 'line' }) type!: string

  @Provide() showFooter: boolean = false
  @Provide() typeMap: KeyMap<string>[] = [
    { key: 'line', name: '折线图' },
    { key: 'histogram', name: '柱状图' }
  ]
  @Provide() chartSettings: any = {
    showDataZoom: true,
    // metrics: []
    type: 'line'
  }
  @Provide() chartDataZoom: any = [{ type: 'slider', start: 0, end: 100 }]
  @Provide() chartData: { columns: string[], rows: Maps<any>[] } = { 
    columns: [], 
    rows: [] 
  }

  @Watch('columns')
  oncolumnsChange (val: Channel.columns[], oldVal: Channel.columns[]): void {
    this.chartData.columns = map(val, 'name')
  }

  @Watch('data')
  onDataChange (val: Maps<any>[], oldVal: Maps<any>[]): void {
    this.chartData = {
        columns: map(this.columns, 'name'),
        rows: val.map(this.parseData).map(this.parseRow)
      }
  }

  parseRow (value: Maps<any>): Maps<any> {
    return zipObject(map(this.columns, 'name'), Object.values(value))
  }

  parseData (value: Maps<any>): Maps<any> {
    for (let column of this.columns) {
      value[column.key] = formatString(value[column.key], column.format)
    }
    return value
  }
  
}
</script>