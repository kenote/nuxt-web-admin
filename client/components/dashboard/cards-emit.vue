<template>
  <div v-if="uemits.length > 0" style="float: right;">
    <el-button v-if="uemits.length === 1"
      type="text"
      style="margin-top: -10px;"
      @click="handleClick(uemits[0], column.key)" >
      {{ iscancel ? '取消' : uemits[0].name }}
    </el-button>
    <el-dropdown v-else @command="(e) => handleCommand(e, column.key)">
      <span class="el-dropdown-link">
        更多操作<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="(emit, key) in uemits" :key="key" :command="emit.key">{{ emit.name }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { Channel } from '@/types/channel'
import { oc } from 'ts-optchain'
import { ruleJudgment } from '@/utils/query'

@Component<DashboardCardsEmit>({ 
  name: 'dashboard-cards-emit',
  mounted () {
    this.uemits = oc(this.column).emit([]).filter( o =>  ruleJudgment({ value: this.value, teams: this.teams, __authLevel: this.authLevel }, o.conditions) )
  }
})
export default class DashboardCardsEmit extends Vue {
  
  @Prop({ default: [] }) column!: Channel.columns
  @Prop({ default: false }) iscancel!: boolean
  @Prop({ default: undefined }) value!: any
  @Prop({ default: 0 }) authLevel!: number
  @Prop({ default: [] }) teams!: string[]

  @Provide() uemits: Channel.columnEmit[] = []

  oc = oc

  @Watch('column')
  onColumnChange (val) {
    // console.log(val)
  }

  handleClick (value: Channel.columnEmit, key: string): void {
    this.$emit('uemit', value, key)
  }

  handleCommand (value: string, key: string): void {
    if (!oc(this.column).emit()) return
    let uemit = this.column.emit?.find( o => o.key === value )
    if (!uemit) return
    this.$emit('uemit', uemit, key)
  }
}
</script>