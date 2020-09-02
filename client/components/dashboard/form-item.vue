<template>
  <!-- 单日期选择 -->
  <el-date-picker v-if="column.type === 'date-picker'"
    v-model="values"
    :type="column.mode || 'date'"
    :placeholder="column.placeholder || '选择日期'"
    :disabled="disabled || column.disabled"
    />
  <!-- 日期范围选择 -->
  <el-date-picker v-else-if="column.type === 'range-picker'"
    v-model="values"
    :type="column.mode || 'daterange'"
    range-separator="至"
    :start-placeholder="oc(column).placeholder[0]('开始日期')"
    :end-placeholder="oc(column).placeholder[1]('结束日期')"
    :disabled="disabled || column.disabled"
    />
  <!-- switch -->
  <el-switch v-else-if="column.type === 'switch'"
    v-model="values"
    @change="handleChangeValue"
    :disabled="disabled || column.disabled"
    />
  <!-- Avatar -->
  <dashboard-avatar-picker v-else-if="column.type === 'avatar-picker'"
    v-model="values"
    :options="column.avatarOptions"
    />
  <!-- 单选框 -->
  <el-radio-group v-else-if="/^(radio)/.test(column.type)" v-model="values" :disabled="disabled || column.disabled">
    <template v-if="column.type === 'radio-button'">
      <el-radio-button v-for="opt in data" :key="opt.key" :label="opt.key">{{ opt.name }}</el-radio-button>
    </template>
    <template v-else>
      <el-radio v-for="opt in data" :key="opt.key" :label="opt.key">{{ opt.name }}</el-radio>
    </template>
  </el-radio-group>
  <!-- 多选框 -->
  <el-checkbox-group v-else-if="/^(checkbox)/.test(column.type)" v-model="values" :disabled="disabled || column.disabled">
    <template v-if="column.type === 'checkbox-button'">
      <el-checkbox-button v-for="opt in data" :key="opt.key" :label="opt.key">{{ opt.name }}</el-checkbox-button>
    </template>
    <template v-else>
      <el-checkbox v-for="opt in data" :key="opt.key" :label="opt.key" :border="column.type === 'checkbox-border'">{{ opt.name }}</el-checkbox>
    </template>
  </el-checkbox-group>
  <!-- 下拉选择器 -->
  <el-select v-else-if="column.type === 'select'"
    v-model="values"
    :multiple="column.multiple"
    filterable
    collapse-tags
    :placeholder="column.placeholder"
    @change="value => $emit('change', value)"
    :disabled="disabled || column.disabled" >
    <template v-if="data">
      <el-option v-for="opt in data" :key="opt.key" :label="opt.name" :value="opt.key"></el-option>
    </template>
  </el-select>
  <!-- 多组选择器 -->
  <dashboard-group-picker v-else-if="column.type === 'group-picker'"
    v-model="values"
    :data="data"
    :multiple="column.multiple"
    :border="column.border"
    />
  <!-- 渠道选择器 -->
  <dashboard-ditch-picker v-else-if="column.type === 'ditch-picker'"
    v-model="values"
    :data="data"
    :options="options"
    :multiple="column.multiple"
    :border="column.border"
    />
  <!-- 物品选择器 -->
  <dashboard-item-picker v-else-if="column.type === 'item-picker'"
    v-model="values"
    :data="data"
    />
  <!-- 数字输入框 -->
  <el-input-number v-else-if="column.type === 'input-number'"
    size="medium" 
    v-model="values" 
    :min="column.min" 
    :max="column.max"
    :disabled="disabled || column.disabled"
    />
  <!-- 多行文本框 -->
  <el-input v-else-if="column.type === 'textarea'"
    type="textarea"
    v-model="values"
    :placeholder="column.placeholder"
    :autosize="{ minRows: 4, maxRows: 4 }"
    style="width:450px;"
    resize="none"
    :disabled="disabled || column.disabled"
    />
  <!-- 单行输入框 -->
  <el-input v-else :placeholder="column.placeholder" v-model="values" style="width:300px;" :disabled="disabled || column.disabled" />
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Model, Watch } from 'nuxt-property-decorator'
import { Maps, Rule } from 'kenote-config-helper'
import { Channel } from '@/types/channel'
import { oc } from 'ts-optchain'
import { DitchOptions } from '@/types'

@Component<DashboardFormItem>({
  name: 'dashboard-form-item',
  created () {
    let { key, api, data } = this.column
    if (api) {
      this.$emit('get-data', api, data => {
        this.data = data
      })
    }
    else if (data) {
      this.data = data
    }
    this.values = this.value
  }
})
export default class DashboardFormItem extends Vue {
  
  @Prop({ default: undefined }) column!: Channel.queryer
  @Prop({ default: undefined }) options!: DitchOptions
  @Prop({ default: false }) disabled!: boolean

  @Provide() data: Maps<any>[] = []
  @Provide() values: any = ''

  @Model('update') value!: any

  oc = oc

  @Watch('values')
  onValuesChange (val: any, oldVal: any): void {
    if (val === oldVal) return
    this.$emit('update', val)
  }

  @Watch('value')
  onValueChange (val: any, oldVal: any): void {
    if (val === oldVal) return
    this.values = val
  }

  handleChangeValue (value: any): void {
    this.$emit('change', value, this.column)
  }
}
</script>