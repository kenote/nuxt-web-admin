<template>
  <div class="search-container">
    <el-form ref="theForm" :label-width="inline ? '120px' : '150px'" :inline="inline" :model="values" :rules="rules" @submit.native.prevent="handleSubmit" :disabled="loading">
      <template v-for="(item, key) in columns">
        <el-form-item :key="key" :prop="item.key" :rules="rules[item.key] || []" :label="item.name">
          <el-select slot="label" v-if="item.label" v-model="values[item.label.key]">
            <el-option v-for="(name, key) in item.label.options" :key="key" :label="name" :value="key"></el-option>
          </el-select>
          <dashboard-form-item v-model="values[item.key]" :column="item" @get-data="handleGetData" />
        </el-form-item>
      </template>
      <el-form-item v-if="inline">
        <el-button type="primary" native-type="submit" :loading="loading">开始查询</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { Form as ElForm } from 'element-ui'
import { Maps, Rule } from 'kenote-config-helper'
import { Channel } from '@/types/channel'
import { oc } from 'ts-optchain'

@Component<DashboardQueryer>({
  name: 'dashboard-queryer',
  created () {
    this.values = { ...this.defaultValues }
  }
})
export default class DashboardQueryer extends Vue {
  
  @Prop({ default: false }) inline!: boolean
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: {} }) rules!: Maps<Rule[]>
  @Prop({ default: [] }) columns!: Channel.queryer[]
  @Prop({ default: {} }) defaultValues!: Maps<any>

  @Provide() values: Maps<any> = {}
  @Provide() labels: Maps<any> = {}

  oc = oc

  handleSubmit (): void {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate(valid => {
      if (valid) {
        this.$emit('submit', this.values)
      }
      else {
        return false
      }
    })
  }

  handleGetData (api: Channel.api, next: (data: Maps<any>[]) => void): void {
    this.$emit('get-data', api, next)
  }
}
</script>