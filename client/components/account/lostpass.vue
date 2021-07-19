<template>
  <div class="landing-body">
    <h3>{{ title }}</h3>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="handleSubmit">
      <slot name="info"></slot>
      <el-form-item prop="code" :rules="rules.code">
        <el-input placeholder="请输入验证码" v-model="values.code" />
      </el-form-item>
      <el-form-item prop="password" :rules="rules.password">
        <el-input type="password" placeholder="设置 8 - 20 位密码" v-model="values.password" />
      </el-form-item>
      <el-form-item prop="repassed" :rules="rules.repassed">
        <el-input type="password" placeholder="请确认新密码" v-model="values.repassed" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">重置密码</el-button>
      </el-form-item>
      <slot></slot>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Emit } from 'nuxt-property-decorator'
import { Account } from '@/types/account'
import { Verify } from '@/types/client'
import { validatePassword, validaterRepassed } from '@/utils/validate'
import { Form as ElForm } from 'element-ui'

@Component<AccountLostpass>({
  name: 'account-lostpass'
})
export default class AccountLostpass extends Vue {
  
  @Prop({ default: false })
  loading!: boolean

  @Prop({ default: '' })
  title!: string

  @Provide()
  values: Account.lostpass = {}

  @Provide()
  rules: Record<string, Array<Verify.Rule>> = {
    code: [
      { required: true, message: '请输入验证码' }
    ],
    password: [
      { required: true, message: '请设置新密码' },
      { validator: validatePassword() }
    ],
    repassed: [
      { required: true, message: '请确认新密码' },
      { validator: validaterRepassed('password', { values: this.values }) }
    ]
  }

  @Emit('submit')
  submit (values: Account.lostpass) {}

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