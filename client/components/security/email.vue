<template>
  <div class="security-container">
    <el-steps :active="stepActive" finish-status="success" align-center>
      <el-step title="验证身份"></el-step>
      <el-step title="设置邮箱"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <div v-if="stepActive === 1" class="main-content">
      <el-form ref="theForm" label-width="150px" :model="values" :rules="rules" @submit.native.prevent="handleSubmit">
        <el-form-item ref="email" prop="email" :rules="rules.email" label="邮箱地址">
          <el-input placeholder="请输入邮箱地址" v-model="values.email" style="width:300px;" />
        </el-form-item>
        <el-form-item prop="code" :rules="rules.code" label="验证码" style="margin-bottom: 42px;">
          <el-input placeholder="请输入验证码" v-model="values.code" style="width:200px;" />
          <el-button v-if="times === 0" @click="handleSendEmail">发送验证码</el-button>
          <el-button v-else disabled>({{ times }} 秒后)重新发送</el-button>
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
import { Form as ElForm, FormItem as ElFormItem } from 'element-ui'
import { pick } from 'lodash'
import { ResponseUserDocument } from '@/types/proxys/user'
import { Register, Security } from '@/types/restful'
import * as PassportAPI from '@/types/apis/passport'

@Component<SecurityEmail>({
  name: 'security-email',
  created () {
    this.stepActive = this.active
  }
})
export default class SecurityEmail extends Vue {

  @Prop({ default: false }) loading!: boolean
  @Prop({ default: null }) user!: ResponseUserDocument
  @Prop({ default: 0 }) times!: number
  @Prop({ default: { step: 60, timeout: 900 } }) options!: Record<'step' | 'timeout', number>
  @Prop({ default: 0 }) active!: number
  @Prop({ default: (type, value) => {} }) unique!: (type: PassportAPI.checkUserType, value: string) => boolean

  @Provide() stepActive: number = 0
  @Provide() values = {
    email: undefined,
    code: undefined
  }
  @Provide() rules: Maps<Rule[]> = {
    email: [
      { required: true, message: '请输入邮箱地址' },
      { type: 'email', message: '请输入正确的邮箱地址，如 example@163.com', trigger: ['blur', 'change'] },
      { validator: this.validateEmail, trigger: ['blur', 'change'] }
    ],
    code: [
      { required: true, message: '请输入验证码' }
    ]
  }

  @Watch('active')
  onChangeActive(val: number, oldVal: number): void {
    this.stepActive = val
  }

  async validateEmail (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> {
    let valid: boolean = await this.unique(value, 'email')
    if (!valid) {
      return callback('该邮箱已绑定其他帐号')
    }
    return callback()
  }

  handleClose (): void {
    this.$emit('close', null)
  }

  handleSendEmail (): void {
    let emailItem: ElFormItem = <ElFormItem> this.$refs['email']
    if (emailItem.$el.className.indexOf('is-success') === -1) return
    let data: Security.sendCode = { type: 'email', name: this.values.email }
    this.$emit('sendcode', data)
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

  handleSend (data: Security.sendCode): void {
    this.$emit('sendcode', data)
  }

  handleVerify (data: Security.verifyCode): void {
    this.$emit('verifycode', data)
  }
  
}
</script>