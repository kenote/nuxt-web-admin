<template>
  <security-view :is-close="true" @close="close">
    <el-steps :active="stepActive" finish-status="success" align-center>
      <el-step title="验证身份"></el-step>
      <el-step :title="`${name}`"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <!-- 变更表单 -->
    <div v-if="stepActive === 1" class="main-content">
      <web-form v-if="formOptions"
        :columns="formOptions.columns"
        :rules="formOptions.rules"
        :default-values="values"
        :unique="unique"
        :code-times="times"
        :verify-code-options="formOptions.verifyCodeOptions"
        @send-code="handleSendCode"
        submit-name="确 定"
        :action="formOptions.action"
        :submit-options="formOptions.submitOptions"
        @submit="submit"
        :loading="loading"
        />
    </div>
    <!-- 修改成功 -->
    <div v-else-if="stepActive === 3" class="main-content">
      <div class="result">
        <slot></slot>
      </div>
    </div>
    <!-- 验证身份 -->
    <security-verify v-else-if="stepActive === 0"
      :auth="auth"
      :options="options"
      :times="times"
      @send-code="sendCode"
      @submit="verifyCode"
      >

    </security-verify>
  </security-view>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Emit, Watch } from 'nuxt-property-decorator'
import { UserDocument } from '@/types/services/db'
import { AccountConfigure } from '@/types/config/account'
import { Verify, Channel } from '@/types/client'
import { Account } from '@/types/account'
import { get } from 'lodash'

@Component<SecurityForm>({
  name: 'security-form',
  created () {
    this.stepActive = this.active
  }
})
export default class SecurityForm extends Vue {

  @Prop({ default: '' })
  name!: string

  @Prop({ default: false })
  loading!: boolean

  @Prop({ default: undefined })
  auth!: UserDocument

  @Prop({ default: 0 })
  times!: number

  @Prop({ default: 0 })
  active!: number

  @Prop({ default: undefined })
  options!: AccountConfigure

  @Prop({ default: undefined })
  formOptions!: Channel.Form

  @Prop({ default: undefined })
  unique!: (name: string, path: string | null, type: string) => Promise<any>
  
  @Provide() 
  stepActive: number = 0

  @Provide()
  values: Record<string, any> = {}

  @Emit('close')
  close () {}

  @Emit('send-code')
  sendCode (data: Account.sendCode) {}

  @Emit('verify-code')
  verifyCode (values: Account.verifyCode) {}

  @Emit('submit')
  submit (values: Record<string, any>, action: Channel.RequestConfig, options: Channel.SubmitOptions) {}

  @Watch('active')
  onActiveChange (val: number, oldVal: number) {
    if (val === oldVal) return
    this.stepActive = val
  }

  handleSendCode (values: Record<string, any>) {
    let { type, associate } = this.formOptions.verifyCode ?? {}
    this.sendCode({
      type: type ?? 'email',
      name: get(values, associate!)
    })
  }
}
</script>