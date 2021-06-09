<template>
  <div class="main-content">
    <p>{{ type === 'mobile' ? '手机' : '邮箱' }}验证码验证<span>账户 <b>{{ username }}</b> 为确认是你本人操作，请完成以下验证</span></p>

    <el-form ref="theForm" label-width="150px" :model="values" :rules="rules" @submit.native.prevent="handleSubmit">
      <el-form-item v-if="type === 'mobile'" label="手机号码">
        <span>{{ mobile.replace(/^(\d{3})\d+(\d{4})$/, '$1****$2') }}</span>
      </el-form-item>
      <el-form-item v-else label="电子邮箱">
        <span>{{ email.replace(/\w{4}@/g, '****@') }}</span>
      </el-form-item>
      <el-form-item prop="code" :rules="rules.code" label="验证码" style="margin-bottom: 42px;">
        <el-input placeholder="请输入验证码" v-model="values.code" style="width:200px;" />
        <el-button v-if="times === 0" @click="sendCode({ type })">发送验证码</el-button>
        <el-button v-else disabled>({{ times }} 秒后)重新发送</el-button>
      </el-form-item>
      <el-form-item >
        <el-button type="primary" native-type="submit" :disabled="!values.code">下一步</el-button>
        <el-dropdown style="margin-left: 30px;" trigger="click" placement="bottom-start" @command="handleCommand">
          <span class="el-dropdown-link">
            验证方式<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="email" :disabled="!binds.includes('email')">电子邮箱</el-dropdown-item>
            <el-dropdown-item command="mobile" :disabled="!binds.includes('mobile')">手机号码</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-form-item>
    </el-form>
    <div class="footer">
      <h2>获取验证码</h2>
      <p>1、验证码获取间隔为 {{ options.mailphoneStep }} 秒。</p>
      <p>2、验证码 {{ options.mailphoneTime / 60 }} 分钟内输入有效，验证码等同于密码，打死也不能告诉别人。</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch, Emit } from 'nuxt-property-decorator'
import { UserDocument } from '@/types/services/db'
import { AccountConfigure, SecurityConfigure } from '@/types/config/account'
import { Verify } from '@/types/client'
import { Form as ElForm } from 'element-ui'
import { Account } from '@/types/account'

interface Values {
  code     ?: string
  type      : 'email' | 'mobile'
}

@Component<SecurityVerify>({
  name: 'security-verify',
  created () {
    this.updateAuth(this.auth)
  }
})
export default class SecurityVerify extends Vue {
  
  @Prop({ default: undefined })
  auth!: UserDocument

  @Prop({ default: 0 })
  times!: number

  @Prop({ default: undefined })
  options!: AccountConfigure

  @Provide()
  username: string = ''

  @Provide()
  email: string = ''

  @Provide()
  mobile: string = ''

  @Provide()
  binds: string[] = []

  @Provide()
  type: Account.verifyUserType = 'email'

  @Provide()
  values: Values = {
    type: this.type
  }

  @Provide()
  rules: Record<string, Array<Verify.Rule>> = {
    code: [
      { required: true, message: '请输入验证码' }
    ]
  }

  @Emit('send-code')
  sendCode (info: Account.sendCode) {}

  @Emit('submit')
  submit (values: Account.verifyCode) {}

  @Watch('auth')
  onAuthChang (val: UserDocument, oldVal: UserDocument) {
    if (val === oldVal) return
    this.updateAuth(val)
  }

  updateAuth (val: UserDocument) {
    this.username = val.username
    this.email = val.email
    this.mobile = val.mobile ?? ''
    this.binds = val.binds
  }

  handleCommand (value: Account.verifyUserType): void {
    if (value === this.type) return
    this.type = value
    let theForm = this.$refs['theForm'] as ElForm
    theForm.resetFields()
  }

  handleSubmit () {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate( valid => {
      if (valid) {
        this.submit({ code: this.values.code })
      }
      else {
        return false
      }
    })
  }
}
</script>