<template>
  <div class="landing-body">
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="handleSubmit" label-position="top" hide-required-asterisk>
      <el-form-item prop="username" :rules="rules.username" label="用户名：">
        <el-input placeholder="账号/邮箱/手机号" v-model="values.username" />
      </el-form-item>
      <el-form-item prop="password" :rules="rules.password" label="密码：">
        <el-input type="password" placeholder="密码" v-model="values.password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">登 录</el-button>
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

@Component<PassportLogin>({
  name: 'passport-login'
})
export default class PassportLogin extends Vue {

  @Prop({ default: false }) loading!: boolean

  @Provide() values: PassportAPI.login = {}
  @Provide() rules = {
    username: [
      { required: true, message: '请输入账号/邮箱/手机号' }
    ],
    password: [
      { required: true, message: '请输入密码' }
    ]
  } as Maps<Rule[]>

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