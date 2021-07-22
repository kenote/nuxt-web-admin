<template>
  <div class="landing-body">
    <h3>注册帐号</h3>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="handleSubmit">
      <el-form-item prop="username" :rules="rules.username">
        <el-input placeholder="请输入您的个人账号" v-model="values.username" />
      </el-form-item>
      <el-form-item prop="email" :rules="rules.email" >
        <el-input placeholder="请输入邮箱地址" v-model="values.email" />
      </el-form-item>
      <el-form-item prop="password" :rules="rules.password">
        <el-input type="password" placeholder="设置 8 - 20 位密码" v-model="values.password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">注 册</el-button>
      </el-form-item>
      <slot></slot>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Emit } from 'nuxt-property-decorator'
import { Account } from '@/types/account'
import { Verify } from '@/types/client'
import { validatePassword, validateUsername, validateEmail } from '@/utils/validate'
import { Form as ElForm } from 'element-ui'

@Component<AccountRegister>({
  name: 'account-register'
})
export default class AccountRegister extends Vue {
  
  @Prop({ default: false })
  loading!: boolean

  @Prop({ default: undefined })
  unique!: (name: string, path: string | null, type: string) => Promise<any>

  @Provide()
  values: Account.register = {}

  @Provide()
  rules: Record<string, Array<Verify.Rule>> = {
    username: [
      { required: true, message: '请输入您的个人账号' },
      { validator: validateUsername('username', null, this), trigger: [ 'blur', 'change' ] }
    ],
    email: [
      { required: true, message: '请输入邮箱地址' },
      { validator: validateEmail('email', null, this), trigger: [ 'blur', 'change' ] }
    ],
    password: [
      { required: true, message: '请设置账号密码' },
      { validator: validatePassword(), trigger: [ 'blur', 'change' ] }
    ]
  }

  @Emit('submit')
  submit (values: Account.register) {}

  handleSubmit () {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate( valid => {
      if (valid) {
        this.submit(this.values)
      }
      else {
        return false
      }
    })
  }
}
</script>