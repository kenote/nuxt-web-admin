<template>
  <div class="security-container">
    <el-steps :active="stepActive" finish-status="success" align-center>
      <el-step title="验证身份"></el-step>
      <el-step title="修改密码"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <div v-if="stepActive === 1" class="main-content">
      <el-form ref="theForm" label-width="150px" :model="values" :rules="rules" @submit.native.prevent="handleSubmit">
        <el-form-item prop="password" :rules="rules.password" label="新密码">
          <el-input placeholder="请输入新密码" type="password" v-model="values.password" style="width:300px;" />
        </el-form-item>
        <el-form-item prop="repassed" :rules="rules.repassed" label="确认新密码">
          <el-input placeholder="请确认新密码" type="password" v-model="values.repassed" style="width:300px;" />
        </el-form-item>
        <el-form-item >
          <el-button type="primary" native-type="submit" :loading="loading">确 定</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-else-if="stepActive === 3" class="main-content">
      <div class="result">
        <slot></slot>
      </div>
    </div>
    <security-verify v-else-if="stepActive === 0" 
      :user="user" 
      :options="options" 
      :times="times" 
      @send="handleSend" 
      @submit="handleVerify" />
    <div class="close_content">
      <i class="el-icon-close" @click="handleClose" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { Maps, Rule } from 'kenote-config-helper'
import { Form as ElForm } from 'element-ui'
import { pick } from 'lodash'
import { ResponseUserDocument } from '@/types/proxys/user'
import { Register, Security } from '@/types/restful'

@Component<SecurityPassword>({
  name: 'security-password',
  created () {
    this.stepActive = this.active
  }
})
export default class SecurityPassword extends Vue {

  @Prop({ default: false }) loading!: boolean
  @Prop({ default: null }) user!: ResponseUserDocument
  @Prop({ default: 0 }) times!: number
  @Prop({ default: { step: 60, timeout: 900 } }) options!: Record<'step' | 'timeout', number>
  @Prop({ default: 0 }) active!: number

  @Provide() stepActive: number = 0
  @Provide() values = {
    password: undefined,
    repassed: undefined
  }
  @Provide() rules: Maps<Rule[]> = {
    password: [
      { required: true, message: '请设置新密码' },
      { validator: this.validatePassword, trigger: ['blur', 'change'] },
    ],
    repassed: [
      { required: true, message: '请确认新密码' },
      { validator: this.validateRepassed, trigger: ['blur', 'change'] }
    ]
  }

  @Watch('active')
  onChangeActive(val: number, oldVal: number): void {
    this.stepActive = val
  }

  validatePassword (rule: any, value: any, callback: (message?: string) => any): (message?: string) => any {
    let valid: boolean = /^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/.test(value)
    if (!valid) {
      return callback('密码支持 8 - 20 位的字母、数字和英文符号')
    }
    return callback()
  }

  validateRepassed (rule: any, value: any, callback: (message?: string) => any): (message?: string) => any {
    let valid: boolean = this.values.password == value
    if (!valid) {
      return callback('两次输入的密码不一致')
    }
    return callback()
  }

  handleClose (): void {
    this.$emit('close', null)
  }

  handleSubmit (): void {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate( valid => {
      if (valid) {
        this.$emit('submit', pick(this.values, ['password']))
      }
      else {
        return false
      }
    })
  }

  handleSend (data: Security.sendCode): void {
    this.$emit('sendcode', data)
  }

  handleVerify (data: Security.verifyCode): void {
    this.$emit('verifycode', data)
  }
  
}
</script>