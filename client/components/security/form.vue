<template>
  <security-view :is-close="true" @close="close">
    <el-steps :active="stepActive" finish-status="success" align-center>
      <el-step title="验证身份"></el-step>
      <el-step :title="`${name}`"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <!-- 变更表单 -->
    <div v-if="stepActive === 1" class="main-content">
      <web-form 
        :columns="Columns"
        :rules="Rules"
        :default-values="values"
        :unique="unique"
        :code-times="times"
        :verify-code-options="verifyCodeOptions"
        @send-code="handleSendCode"
        submit-name="确 定"
        :action="action"
        :submit-options="submitOptions"
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
import ruleJudgment from 'rule-judgment'
import { cloneDeep, get } from 'lodash'

@Component<SecurityForm>({
  name: 'security-form',
  created () {
    this.stepActive = this.active
    let options = this.options.security.find( ruleJudgment({ key: this.type } ))
    if (options) {
      let { columns, rules, verifyCode, submitOptions, action } = options.formOptions ?? {}
      this.Columns = columns ?? []
      this.Rules = cloneDeep(rules) ?? {}
      this.verifyCodeOptions = verifyCode ?? { type: 'email' }
      this.action = action ?? {}
      this.submitOptions = submitOptions ?? {}
    }
  }
})
export default class SecurityForm extends Vue {

  @Prop({ default: '' })
  type!: string

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

  @Provide()
  Columns: Channel.FormItem[] = []

  @Provide()
  Rules: Record<string, Array<Verify.Rule>> = {}

  @Provide()
  verifyCodeOptions: Channel.verifyCodeOptions = { type: 'email' }

  @Provide()
  action: Channel.RequestConfig = {}

  @Provide()
  submitOptions: Channel.SubmitOptions = {}

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
    let { type, associate } = this.verifyCodeOptions
    this.sendCode({
      type,
      name: get(values, associate!)
    })
  }
}
</script>