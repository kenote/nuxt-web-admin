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
import { Component, Vue, Prop, Provide, Emit } from 'nuxt-property-decorator'
import { Account } from '@/types/account'
import { Form as ElForm } from 'element-ui'
import { Verify } from '@/types/client'
import { validateMobile } from '@/utils/validate'

@Component<VerifyUser>({
  name: 'account-verifyuser'
})
export default class VerifyUser extends Vue {

  @Prop({ default: false })
  loading!: boolean

  @Prop({ default: '' })
  title!: string

  @Provide()
  values: Account.verifyUser = {
    type: 'email',
    email: { name: '' },
    mobile: { name: '' }
  }

  @Provide()
  emailRules: Record<string, Array<Verify.Rule>> = {
    name: [
      { required: true, message: '请输入邮箱地址' },
      { type: 'email', message: '请输入正确的邮箱地址，如 example@163.com', trigger: ['blur', 'change'] }
    ]
  }

  @Provide()
  mobileRules: Record<string, Array<Verify.Rule>> = {
    name: [
      { required: true, message: '请输入手机号码' },
      { validator: validateMobile('zh-CN'), trigger: ['blur', 'change'] }
    ]
  }

  @Emit('submit')
  submit (value: Account.verifyUserRequest) {}

  handleChangeType (type: Account.verifyUserType) {
    let theForm = this.$refs[type] as ElForm
    theForm.resetFields()
    this.values[type].name = ''
  }

  handleSubmit (type: Account.verifyUserType) {
    let theForm = this.$refs[type] as ElForm
    theForm.validate( valid => {
      if (valid) {
        this.submit({ type, name: this.values[type].name ?? '' })
      }
      return false
    })
  }
  
}
</script>