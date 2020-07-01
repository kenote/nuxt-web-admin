<template>
  <div class="form-container">
    <h2>{{ name }}</h2>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="handleSubmit" label-width="150px">
      <template v-for="(item, key) in columns">
        <el-form-item :key="key" :prop="item.key" :rules="rules[item.key] || []" :label="item.name">
          <dashboard-form-item v-model="values[item.key]" :column="item" @get-data="handleGetData" />
        </el-form-item>
      </template>
      <el-form-item >
        <el-button type="primary" native-type="submit" :loading="loading">提 交</el-button>
        <el-button type="success" @click="$emit('goback', null)">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Model } from 'nuxt-property-decorator'
import { Form as ElForm } from 'element-ui'
import { Maps, Rule } from 'kenote-config-helper'
import { Channel } from '@/types/channel'
import { oc } from 'ts-optchain'

@Component<DashboardForm>({
  name: 'dashboard-form',
  created () {
    this.values = this.defaultValues
  }
})
export default class DashboardForm extends Vue {

  @Prop({ default: undefined }) name!: string
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: {} }) rules!: Maps<Rule[]>
  @Prop({ default: {} }) defaultValues!: Maps<any>
  @Prop({ default: [] }) columns!: Channel.queryer[]

  @Provide() values: Maps<any> = {}
  @Provide() data: Maps<any> = {}

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