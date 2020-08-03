<template>
  <div>
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="8" v-for="(item, key) in data" :key="key">
        <el-card v-if="oc(options).type() === 'user-info'">
          <div slot="header" class="clearfix">
            <span >{{ columnName(item) }}</span>
            <dashboard-cards-emit v-if="oc(columnItem(item)).emit()"
              :column="columnItem(item)"
              :value="item.value"
              :teams="teams"
              :auth-level="authLevel"
              :iscancel="emitItem.key === 'edit' && edited == item.name"
              @uemit="handleUemit" />
          </div>
          <div style="min-height: 50px">

            <span  style="font-size:23px;font-weigth:500;">{{ formatString(item) }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { Maps } from 'kenote-config-helper'
import { Channel } from '@/types/channel'
import { Cards } from 'kenote-config-helper/types/navigation'
import { oc } from 'ts-optchain'
import { formatString } from '@/utils/format'

@Component<dashboardCards>({
  name: 'dashboard-cards'
})
export default class dashboardCards extends Vue {
  
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: [] }) data!: Maps<any>[]
  @Prop({ default: [] }) columns!: Channel.columns[]
  @Prop({ default: undefined }) options!: Cards
  @Prop({ default: 0 }) authLevel!: number
  @Prop({ default: [] }) teams!: string[]

  @Provide() edited: string = ''
  @Provide() emitItem: Channel.columnEmit = { key: '', name: '', api: '' }

  oc = oc

  @Watch('data')
  onDataChange (val: Array<{}>, oldVal: Array<{}>): void {
    this.edited = ''
    this.emitItem = { key: '', name: '', api: '' }
    // this.handleDialogColse()
  }

  async handleUemit (uemit: Channel.columnEmit, key: string): Promise<void> {
    if (key === this.edited) {
      this.edited = ''
      this.emitItem = { key: '', name: '', api: '' }
      return
    }
    this.edited = key
    this.emitItem = uemit
    if (uemit.key != 'edit') {
      let { key: k, param } = oc(this.options).emit({ key: '用户id', param: 'roleId' })
      let obj = this.data.find( o => o.name === k )
      let values = {
        [param]: oc(obj).value(),
        ...uemit.options
      }
      this.$emit('update-data', uemit.api, values)
    }
  }

  formatString (item: Maps<any>): any {
    let { name, value } = oc(item)({})
    let column = this.columnItem(item)
    return formatString(value, oc(column).format(), oc(column).default())
  }

  columnItem (item: Maps<any>): Channel.columns | undefined {
    let { name } = oc(item)({})
    let column = this.columns.find( o => o.key === name )
    return column
  }

  columnName (item: Maps<any>): string | undefined {
    let { name, value } = oc(item)({})
    let column = this.columnItem(item)
    return oc(column).name(name)
  }
}
</script>

<style lang="scss">
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
    margin-bottom: 20px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
</style>