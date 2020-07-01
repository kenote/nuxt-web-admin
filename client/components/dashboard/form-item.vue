<template>
  <el-date-picker v-if="column.type === 'date-picker'"
    v-model="values"
    :type="column.mode || 'date'"
    :placeholder="column.placeholder || '选择日期'"
    />
  <el-date-picker v-else-if="column.type === 'range-picker'"
    v-model="values"
    :type="column.mode || 'daterange'"
    range-separator="至"
    :start-placeholder="oc(column).placeholder[0]('开始日期')"
    :end-placeholder="oc(column).placeholder[1]('结束日期')"
    />
  <el-select v-else-if="column.type === 'select'"
    v-model="values"
    :multiple="column.multiple"
    filterable
    collapse-tags
    :placeholder="column.placeholder" >
    <template v-if="data">
      <el-option v-for="opt in data" :key="opt.key" :label="opt.name" :value="opt.key"></el-option>
    </template>
  </el-select>
  <el-input-number v-else-if="column.type === 'input-number'"
    size="medium" 
    v-model="values" 
    :min="column.min" 
    :max="column.max"
    :disabled="column.disabled"
    />
  <el-input v-else-if="column.type === 'textarea'"
    type="textarea"
    v-model="values"
    :placeholder="column.placeholder"
    :autosize="{ minRows: 4, maxRows: 4 }"
    style="width:450px;"
    resize="none"
    :disabled="column.disabled"
    />
  <el-input v-else :placeholder="column.placeholder" v-model="values" style="width:300px;" :disabled="column.disabled" />
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Model, Watch } from 'nuxt-property-decorator'
import { Maps, Rule } from 'kenote-config-helper'
import { Channel } from '@/types/channel'
import { oc } from 'ts-optchain'

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

  @Provide() data: Maps<any>[] = []
  @Provide() values: any = ''

  @Model('update') value!: any

  oc = oc

  @Watch('values')
  onValueChange (val: any, oldVal: any): void {
    this.$emit('update', val)
  }
}
</script>