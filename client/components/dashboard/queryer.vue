<template>
  <div class="search-container" v-if="columns.length > 0">
    <el-form ref="theForm" :label-width="inline ? '120px' : '150px'" :inline="inline" :model="values" :rules="_rules" @submit.native.prevent="handleSubmit" :disabled="loading">
      <template v-for="(item, key) in columns">
        <el-form-item :key="key" :prop="item.key" :rules="_rules[item.key] || []" :label="item.name">
          <el-select slot="label" v-if="item.label" v-model="values[item.label.key]">
            <el-option v-for="(name, key) in item.label.options" :key="key" :label="name" :value="key"></el-option>
          </el-select>
          <dashboard-form-item v-model="values[item.key]" :column="item" @get-data="handleGetData" @get-plans="handleGetPlans" :options="ditchOptions" />
        </el-form-item>
      </template>
      <el-form-item v-if="inline">
        <el-button type="primary" native-type="submit" :loading="loading">开始查询</el-button>
      </el-form-item>
      <div v-else class="footer" style="padding-left: 0; margin-left: 0">
        <el-form-item>
          <el-dropdown @command="handleCommandSubmit" v-if="oc(rtsps)([]).length > 1" >
            <el-button type="primary">
              开始查询<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="item in rtsps" :key="item" :command="item">线路 -> {{ item }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button v-else type="primary" native-type="submit" :loading="loading">开始查询</el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch, Emit } from 'nuxt-property-decorator'
import { Form as ElForm } from 'element-ui'
import { Maps, Rule } from 'kenote-config-helper'
import { Channel } from '@/types/channel'
import { oc } from 'ts-optchain'
import { parseDefaultValue } from '@/utils'
import { DitchOptions } from '@/types'
import { ResponsePlanDocument, PlanType } from '@/types/proxys/plan'
import { UpdateWriteResult, DeleteWriteResult } from 'kenote-mongoose-helper'
import { omit, zipObject } from 'lodash'

@Component<DashboardQueryer>({
  name: 'dashboard-queryer',
  created () {
    this.values = { ...this.defaultValues }
    this._rules = { ...this.rules }
    
  }
})
export default class DashboardQueryer extends Vue {
  
  @Prop({ default: false }) inline!: boolean
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: {} }) rules!: Maps<Rule[]>
  @Prop({ default: [] }) columns!: Channel.queryer[]
  @Prop({ default: {} }) defaultValues!: Maps<any>
  @Prop({ default: undefined }) rtsps!: string[]

  @Provide() values: Maps<any> = {}
  @Provide() labels: Maps<any> = {}
  @Provide() _rules: Maps<Rule[]> = {}
  @Provide() ditchOptions: DitchOptions = {
    plan: {
      pid         : Date.now(),
      get         : this.handleGetPlans, 
      create      : this.handleCreatePlan,
      update      : this.handleUpdatePlan,
      remove      : this.handleRemovePlan
    }
  }

  oc = oc

  @Watch('columns')
  onColumnsChange (val: Channel.queryer[], oldVal: Channel.queryer[]): void {
    let values = { ...this.values }
    let rules = { ...this._rules }
    for (let item of val) {
      if (item.default) {
        values[item.key] = parseDefaultValue(item.default)
      }
      if (item.rules) {
        rules[item.key] = item.rules
      }
    }
    this.values = values
    this._rules = rules
  }

  handleRest (): void {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.resetFields()
  }

  handleCommandSubmit (command: string): void {
    this.handleSubmit(null, command)
  }

  handleSubmit (env: Event | null, rstp?: string): void {
    let theForm = this.$refs['theForm'] as ElForm
    if (!rstp && this.rtsps) {
      rstp = this.rtsps[0]
    }
    theForm.validate(valid => {
      if (valid) {
        let queryers: Channel.queryer[] = this.columns.filter( o => o.required )
        for (let queryer of queryers) {
          let { key, name } = queryer
          if (!this.values[key] || this.values[key].length === 0) {
            this.$message({
              message: `请选择${name}！！！`,
              type: 'warning'
            })
            return
          }
        }
        let values = omit(this.values, ['begin_end'])
        if (this.values['begin_end']) {
          values = {
            ...values,
            ...zipObject(['begin', 'end'], this.values['begin_end'])
          }
        }
        this.$emit('submit', values, rstp)
      }
      else {
        return false
      }
    })
  }

  handleGetData (api: Channel.api, next: (data: Maps<any>[]) => void): void {
    this.$emit('get-data', api, next)
  }

  handleGetPlans (type: PlanType, next: (doc: ResponsePlanDocument[]) => void): void {
    this.$emit('get-plans', type, next)
  }

  handleCreatePlan (type: PlanType, name: string, value: any, next: (doc: ResponsePlanDocument) => void): void {
    this.$emit('create-plan', type, name, value, next)
  }

  handleUpdatePlan (_id: string, name: string, value: any, next: (doc: UpdateWriteResult) => void): void {
    this.$emit('update-plan', _id, name, value, next)
  }

  handleRemovePlan (_id: string, next: (data: DeleteWriteResult) => void): void {
    this.$emit('remove-plan', _id, next)
  }
}
</script>