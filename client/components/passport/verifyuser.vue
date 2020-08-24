<template>
  <div class="landing-body">
    <h3>{{ title }}</h3>
    <el-form>
      <el-radio-group v-model="values.type" @change="handleChangeType">
        <el-radio label="mobile">通过手机号</el-radio>
        <el-radio label="email">通过邮箱</el-radio>
      </el-radio-group>
    </el-form>
    <el-form class="lostpass-start" ref="email" v-if="values.type === 'email'" :model="values.email" :rules="emailRules" @submit.native.prevent="handleSubmit(values.type)">
      <el-form-item prop="name" :rules="emailRules.name" style="margin-bottom: 20px;">
        <el-input placeholder="请输入您的邮箱地址" v-model="values.email.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">获取验证码</el-button>
      </el-form-item>
      <slot></slot>
    </el-form>
    <el-form class="lostpass-start" ref="mobile" v-if="values.type === 'mobile'" :model="values.mobile" :rules="mobileRules" @submit.native.prevent="handleSubmit(values.type)">
       <el-form-item prop="name" :rules="mobileRules.name" style="margin-bottom: 20px;">
        <el-input placeholder="请输入您的手机号码" v-model="values.mobile.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">获取验证码</el-button>
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

@Component<PassportVerifyUser>({
  name: 'passport-verifyuser'
})
export default class PassportVerifyUser extends Vue {
  
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: '' }) title!: string

  @Provide() values: PassportAPI.verifyUser = {
    type    : 'email',
    email   : { name: '' },
    mobile  : { name: '' }
  }
  @Provide() emailRules = {
    name: [
      { required: true, message: '请输入邮箱地址' },
      { type: 'email', message: '请输入正确的邮箱地址，如 example@163.com', trigger: ['blur', 'change'] }
    ]
  } as Maps<Rule[]>
  @Provide() mobileRules = {
    name: [
      { required: true, message: '请输入手机号码' },
      { validator: validateMobile, trigger: ['blur', 'change'] }
    ]
  } as Maps<Rule[]>

  handleChangeType (type: PassportAPI.verifyUserType): void {
    let theForm = this.$refs[type] as ElForm
    theForm.resetFields()
    this.values[type].name = ''
  }

  handleSubmit (type: PassportAPI.verifyUserType): void {
    let theForm = this.$refs[type] as ElForm
    theForm.validate( valid => {
      if (valid) {
        this.$emit('submit', { type, name: this.values[type].name! })
      }
      else {
        return false
      }
    })
  }

}

function validateMobile (rule: any, value: any, callback: (message?: string) => any): (message?: string) => any {
  let valid: boolean = validator.isMobilePhone(value, 'zh-CN')
  if (!valid) {
    return callback('请输入正确的手机号码，且不可使用虚拟手机号码')
  }
  return callback()
}
</script>