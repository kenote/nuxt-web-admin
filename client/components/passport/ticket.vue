<template>
  <div class="landing-body">
    <h3>{{ name }}</h3>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="handleSubmit" >
      <el-form-item prop="cdkey" :rules="rules.cdkey">
        <el-input :placeholder="`请输入您的${name}`" v-model="values.cdkey" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">下一步</el-button>
      </el-form-item>
      <slot></slot>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from 'nuxt-property-decorator'
import * as PassportAPI from '@/types/apis/passport'
import { Maps, Rule } from 'kenote-config-helper'
import { Form as ElForm } from 'element-ui'
import validator from 'validator'

@Component<PassportTicket>({
  name: 'passport-ticket'
})
export default class PassportTicket extends Vue {

  @Prop({ default: false }) loading!: boolean
  @Prop({ default: '兑换码' }) name!: string
  
  @Provide() values: PassportAPI.ticket = {}
  @Provide() rules: Maps<Rule[]> = {
    cdkey: [
      { required: true, message: `请输入${this.name}` },
      { validator: this.validateCDKey }
    ]
  }

  validateCDKey (rule: any, value: any, callback: (message?: string) =>any): (message?: string) => any {
    let valid: boolean = validator.isUUID(value, 4)
    if (!valid) {
      return callback(`请输入正确的${ this.name }`)
    }
    return callback()
  }

  handleSubmit (): void {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate( valid => {
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