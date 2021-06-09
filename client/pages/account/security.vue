<template>
  <dashboard v-loading="initinal">
    
    <transition-group name="el-zoom-in-top">
      <!-- 表单视图 -->
      <template v-for="(security) in accountOptions.security">
        <security-form v-if="viewtype === security.key"
          :key="security.key"
          :type="security.key"
          :name="security.title"
          :auth="auth"
          :options="accountOptions"
          :times="times"
          :active="active"
          :unique="handleUnique"
          @close="handleView('overview')"
          @send-code="handleSendCode"
          @verify-code="handleVerifyCode"
          @submit="handleSubmit"
          >
          <i class="el-icon-success" />
          <h2>{{ security.title }}成功</h2>
          <p>结果已经提交到服务器，并且已经生效。</p>
        </security-form>
      </template>
      <!-- 概述 -->
      <div v-if="viewtype === 'overview'" class="security-container" key="overview">
        <security-panel v-for="(security) in accountOptions.security" 
          :key="security.key"
          :name="security.name"
          :description="security.description"
          :data="security.data"
          :success="security.success"
          :disabled="security.disabled"
          :buttonName="security.buttonName"
          :danger="security.danger"
          :times="times"
          :env="env"
          @click="handleView(security.key)"
          @command="handleCommand"
          />
      </div>
    </transition-group>
  </dashboard>
</template>

<script lang="ts">
import { Component, mixins, Provide, Watch } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { HttpResult, Channel, Verify, HttpClientOptions } from '@/types/client'
import { UserDocument } from '@/types/services/db'
import { isEqual, map, pick, merge, get } from 'lodash'
import nunjucks from 'nunjucks'
import { SecurityConfigure } from '@/types/config/account'
import { Account } from '@/types/account'
import { runCommand } from '@/utils'

@Component<SecurityPage>({
  name: 'security-page',
  middleware: [ 'authenticated' ],
  layout: 'dashboard',
  created () {
    this.env = {
      auth: this.auth
    }
  }
})
export default class SecurityPage extends mixins(PageMixin) {

  @Provide()
  env: Record<string, any> = {}

  @Provide()
  viewtype: SecurityConfigure.viewType = 'overview'

  @Provide()
  verify_id: string | null = null

  @Provide() 
  active: number = 0

  @Provide()
  refreshAuth: boolean = false

  @Provide()
  newColumns: Channel.FormItem[] = [
    {
      key: 'email',
      name: '电子邮箱',
      type: 'input',
      placeholder: '请输入电子邮箱'
    },
    {
      key: 'mobile',
      name: '手机号',
      type: 'input',
      placeholder: '请输入手机号码'
    }
  ]

  @Provide()
  newRules: Record<string, Array<Verify.Rule>> = {
    email: [
      { required: true, message: '电子邮箱不能为空' },
      { type: 'email', message: '请输入正确的邮箱地址，如 example@163.com' }
    ]
  }

  @Watch('auth')
  onAuthChange (val: UserDocument, oldVal: UserDocument) {
    if (val === oldVal) return
    this.env = {
      auth: val
    }
  }

  /**
   * 切换视图
   */
  handleView (key: SecurityConfigure.viewType) {
    let keys = map(this.accountOptions.security, 'key')
    this.viewtype = keys.includes(key) ? key : 'overview'
    this.active = 0
    if (this.$parent.$parent) {
      this.$parent.$parent.$el.scrollTop = 0
    }
  }

  /**
   * 发送验证码
   */
  async handleSendCode (info: Account.sendCode) {
    if (info.name) {
      info.verify_id = this.verify_id
    }
    try {
      let result = await this.$httpClient(this.httpOptions).PUT<HttpResult<any>>(`/api/account/sendcode/${info.type}`, pick(info, ['name', 'verify_id']))
      if (result?.error) {
        this.$message.error(result.error)
      }
      else {
        this.sendWait(this.accountOptions.mailphoneStep)
        this.$message.success('验证码已发送')
      }
    } catch (error) {
      this.$message.error(error.message)
    }
  }

  /**
   * 校验验证码
   */
  async handleVerifyCode (values: Account.verifyCode) {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await this.$httpClient(this.httpOptions).POST<HttpResult<any>>(`/api/account/verifycode`, pick(values, ['code']))
        if (result?.error) {
          this.$message.error(result.error)
        }
        else {
          this.verify_id = result?.data?.verify_id
          this.active = 1
        }
      } catch (error) {
        this.$message.error(error.message)
      }
      this.loading = false
    }, 300)
  }

  /**
   * 发送验证邮件
   */
  handleSendEmailVerify () {
    if (this.times > 0) {
      this.$message.warning(`请不要连续点击发送，等待（${this.times} 秒）`)
      return
    }
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await this.$httpClient(this.httpOptions).GET<HttpResult<any>>('/api/account/email_verify')
        if (result?.error) {
          this.$message.error(result.error)
        }
        else {
          this.sendWait(this.accountOptions.mailphoneStep)
        }
      } catch (error) {
        this.$message.error(error.message)
      }
      this.loading = false
    }, 300)
  }

  handleRefreshAuth () {
    this.refreshAuth = true
    setTimeout(async () => {
      try {
        let result = await this.$httpClient(this.httpOptions).GET<HttpResult<UserDocument>>('/api/account/accesstoken')
        if (result?.error) {
          this.$message.error(result.error)
        }
        else {
          if (!isEqual(this.auth, result?.data)) {
            this.$store.commit(this.types.auth.AUTH, result?.data)
          }
        }
      } catch (error) {
        this.$message.error(error.message)
      }
      this.refreshAuth = false
    }, 300)
  }

  /**
   * 提交设置值
   */
  handleSubmit (values: Account.upInfo<any>, action: Channel.RequestConfig, options: Channel.SubmitOptions) {
    let { method, url, headers } = action
    let { commit, commitValue } = options
    let httpOptions: HttpClientOptions = merge(this.httpOptions, { headers })
    values.verify_id = this.verify_id
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await this.$httpClient(httpOptions)[method ?? 'POST'](url ?? '', values) as HttpResult<any>
        if (result?.error) {
          this.$message.error(result.error)
        }
        else {
          if (commit) {
            let commitType = get(this.types, commit)
            commitType && this.$store.commit(commitType, commitValue ? get(values, commitValue) : result.data)
          }
          this.active = 3
        }
      } catch (error) {
        this.$message.error(error.message)
      }
      this.loading = false
    }, 300)
  }

  /**
   * 运行指令集
   */
  handleCommand = runCommand(this, {
    sendEmailVerify: this.handleSendEmailVerify
  })

  /**
   * 查询验证 用户名/邮箱/手机号重名
   */
  async handleUnique (name: string, path: string | null, type: string) {
    let Iurl = nunjucks.renderString('/api/account/check/{{type}}', { type })
    let values = {
      name,
      _id: this.auth?._id
    }
    try {
      let result = await this.$httpClient(this.httpOptions).PUT<HttpResult<boolean>>(Iurl, values)
      if (result?.error) {
        return false
      }
      return true
    } catch (error) {
      this.$message.warning(error.message)
    }
  }
}
</script>

<style lang="scss">
.security-container {
  padding: 0 30px;
  font-family: Lantinghei;
  color: #444242;
  max-width: 960px;
  min-width: 960px;
  margin: auto;
  position: relative;

  .panel {

    .panel-body {
      display: flex;
      justify-content: space-between;
      //align-items: center;
      min-height: 100px;
      padding: 44px 30px;

      .panel-content {
        padding: 0 20px 0 0;

        h4 {
          height: 26px;
          margin: 0 0 20px;
          line-height: 26px;
          font-size: 18px;
          font-weight: 400;

          i {
            font-size: 20px;

            &.success {
              color: #4CAF50;
            }

            &.info {
              color: #ffc107;
            }

            &.warning {
              color: #FF5722;
            }
          }

          &+p {
            margin-top: 20px;
          }

          &:not(:first-child) {
            margin-top: 20px;
            font-size: 1.2em;
          }
        }

        p {
          color: #747474;
          line-height: 1.8;
          margin: 0 ;
        }

        .row-inline {
          list-style: none;
          display: flex;
          padding: 0;

          &>li {
            margin: 0 30px 10px 0!important;
            color: #747474;

            &:before {
              width: 8px;
              height: 8px;
              background-color: #52acd9;
              color: #52acd9;
              display: inline-block;
              border-radius: 50%;
              margin-right: 5px;
              content: '';
            }
          }
        }

      }

      .panel-sidebar {
        display: flex;
        align-items: flex-end;
        padding: 0 30px 30px 0;

        .el-button {
          border-radius: 0;
        }
      }
    }
    
    &:not(:last-child) {
      border-bottom: 1px solid #ecedf1;
    }
  }

  .main-content {
    margin: auto;
    margin-top: 80px;

    .form-container {
      margin-top: -40px !important;
    }

    p {
      margin: auto !important;
      width: 600px;
      border-bottom: 1px solid rgb(153, 153, 153);

      span {
        margin-left: 20px;
      }
    }

    .el-form {
      margin: 40px auto auto;
      width: 600px;

      .el-form-item {
        margin-bottom: 28px;
      }

      .el-form-item__label {
        padding-right: 20px;
        color: #777;
      }

      .el-input__inner {
        border-radius: 0;
      }

      .el-button {
        border-radius: 0;
      }

      .el-button--primary {
        width: 150px;
      }
    }

    .footer {
      margin: auto;
      border-top: 1px dashed #e8e8e8;
      width: 700px;
      margin-top: 50px;
      padding: 15px 60px 0;

      h2 {
        font-size: 15px !important;
        margin-bottom: 16px;
      }

      p {
        line-height: 1.8;
        margin-left: 20px;
        border-bottom: 0;
        width: auto;
      }
    }

    .result {
      margin: 0 auto;
      text-align: center;

      i {
        color: #52c41a;
        font-size: 72px;
        line-height: 72px;
        margin-bottom: 24px;
      }

      h2 {
        font-size: 24px;
      }

      p {
        border-bottom: 0;
      }
    }
  }

  .close_content {
    position: absolute;
    top: -40px;
    right: 0;
    font-size: 24px;

    i {
      cursor: pointer;

      &:hover {
        color: #52acd9;
        animation: rotating 1.2s linear infinite;
      }
    }
  }

}

</style>