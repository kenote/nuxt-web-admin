<template>
  <div class="main-content">
    <p>{{ type === 'mobile' ? '手机' : '邮箱' }}验证码验证<span>账户 <b>{{ user && user.username }}</b> 为确认是你本人操作，请完成以下验证</span></p>
    <el-form ref="theForm" label-width="150px" :model="values" :rules="rules" @submit.native.prevent="handleSubmit">
      <el-form-item v-if="type === 'mobile'" label="手机号码">
        <span>{{ user && user.mobile && user.mobile.replace(/^(\d{3})\d+(\d{4})$/, '$1****$2') }}</span>
      </el-form-item>
      <el-form-item v-else label="电子邮箱">
        <span>{{ user && user.email.replace(/\w{4}@/g, '****@') }}</span>
      </el-form-item>
      <el-form-item prop="code" :rules="rules.code" label="验证码" style="margin-bottom: 42px;">
        <el-input placeholder="请输入验证码" v-model="values.code" style="width:200px;" />
        <el-button v-if="times === 0" @click="handleSend">发送验证码</el-button>
        <el-button v-else disabled>({{ times }} 秒后)重新发送</el-button>
      </el-form-item>
      <el-form-item >
        <el-button type="primary" native-type="submit" :loading="loading">下一步</el-button>
        <el-dropdown style="margin-left: 30px;" trigger="click" placement="bottom-start" @command="handleCommand">
          <span class="el-dropdown-link">
            验证方式<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="email">电子邮箱</el-dropdown-item>
            <el-dropdown-item command="mobile" :disabled="user && !user.binds.includes('mobile')">手机号码</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-form-item>
    </el-form>
    <div class="footer">
      <h2>获取验证码</h2>
      <p>1、验证码获取间隔为 {{ options.step }} 秒。</p>
      <p>2、验证码 {{ options.timeout / 60 }} 分钟内输入有效，验证码等同于密码，打死也不能告诉别人。</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { Maps, Rule } from 'kenote-config-helper'
import { Form as ElForm } from 'element-ui'
import { ResponseUserDocument } from '@/types/proxys/user'
import * as PassportAPI from '@/types/apis/passport'
import { pick } from 'lodash'

@Component<SecurityVerify>({
  name: 'security-verify'
})
export default class SecurityVerify extends Vue {

  @Prop({ default: false }) loading!: boolean
  @Prop({ default: null }) user!: ResponseUserDocument
  @Prop({ default: 0 }) times!: number
  @Prop({ default: { step: 60, timeout: 900 } }) options!: Record<'step' | 'timeout', number>

  @Provide() type: PassportAPI.verifyUserType = 'email'
  @Provide() values = {
    code: undefined,
    type: this.type
  }
  @Provide() rules: Maps<Rule[]> = {
    code: [
      { required: true, message: '请输入验证码' }
    ]
  }

  @Watch('type')
  onTypeChange (val: PassportAPI.verifyUserType, oldVal: PassportAPI.verifyUserType): void {
    this.values.type = val
  }

  handleSend (): void {
    if (this.times > 0) return
    this.$emit('send', pick(this.values, ['type']))
  }

  handleCommand (value: PassportAPI.verifyUserType): void {
    if (value === this.type) return
    this.type = value
  }

  handleSubmit (): void {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate( valid => {
      if (valid) {
        this.$emit('submit', pick(this.values, ['code']))
      }
      else {
        return false
      }
    })
  }
  
}
</script>