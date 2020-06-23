<template>
  <div class="form-container">
    <h2>{{ name }}</h2>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="handleSubmit" label-width="150px">
      <template v-for="(item, key) in columns">
        <el-form-item :key="key" :prop="item.key" :rules="rules[item.key] || []" :label="item.name">
          <el-input-number v-if="item.type === 'input-number'"
            size="medium" 
            v-model="values[item.key]" 
            :min="item.min" 
            :max="item.max"
            :disabled="item.disabled"
            />
          <el-input v-else-if="item.type === 'textarea'"
            type="textarea"
            v-model="values[item.key]"
            :placeholder="item.placeholder"
            :autosize="{ minRows: 4, maxRows: 4 }"
            style="width:450px;"
            resize="none"
            :disabled="item.disabled"
            />
          <el-input v-else :placeholder="item.placeholder" v-model="values[item.key]" style="width:300px;" :disabled="item.disabled" />
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
  
}
</script>