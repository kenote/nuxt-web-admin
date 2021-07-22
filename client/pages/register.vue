<template>
  <page v-if="steptag === 'invitation'">
    <account-ticket title="邀请码" @submit="handleInvitation" v-loading="loading" :loading="loading">
      <p class="service-terms">
        系统已经关闭的注册入口，您必须拥有邀请码才能注册
      </p>
      <p class="service-terms">
        <nuxt-link to="/login" class="ng-hide">立即登录</nuxt-link>
      </p>
    </account-ticket>
  </page>
  <page v-else-if="steptag === 'submitinfo'">
    <account-register @submit="handleSubmit" v-loading="loading" :loading="loading" :unique="handleUnique">
      <p class="service-terms">
        请您仔细阅读并同意遵守
        <a href="javascript:;">《服务条款》</a>
        <nuxt-link to="/login" class="ng-hide">立即登录</nuxt-link>
      </p>
    </account-register>
  </page>
  <page v-else-if="steptag ==='finished'">
    <div class="landing-body" style="width:500px">
      <h3>注册成功</h3>
      <h5>验证邮件已发送至您的注册邮箱</h5>
      <div class="content" style="text-align: center;">
        <p>请在 {{ accountOptions.emailVerify.timeout / 3600 }} 小时内进行邮箱验证</p>
        <p>您还可以操作，<nuxt-link to="/login">登录后台</nuxt-link></p>
        <a class="el-button el-button--primary" :href="`https://mail.${email.replace(/^(\S+)\@/, '')}`" target="_blank">登录邮箱</a>
      </div>
      <div class="content">
        <p>没有收到邮件 ？</p>
        <ul>
          <li>登录后台，验证邮箱</li>
          <li>检查您的邮件垃圾箱、广告邮件等</li>
        </ul>
      </div>
    </div>
  </page>
</template>

<script lang="ts">
import { Component, mixins, Provide } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { Account } from '@/types/account'
import { HttpResult } from '@/types/client'
import { TicketDocument, UserDocument } from '@/types/services/db'

@Component<RegisterPage>({
  name: 'register-page',
  layout: 'account',
  created () {
    if (!this.accountOptions.invitation) {
      this.steptag = 'submitinfo'
    }
  }
})
export default class RegisterPage extends mixins(PageMixin) {

  @Provide()
  steptag: 'invitation' | 'submitinfo' | 'finished' = 'invitation'

  @Provide()
  email: string = ''

  @Provide()
  cdkey?: string = ''
  

  handleInvitation (values: Account.ticket) {
    values.name = '邀请码'
    values.type = 'register'
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await this.$httpClient().PUT<HttpResult<TicketDocument>>('/api/ticket/verify', values)
        if (result?.error) {
          this.$message.warning(result?.error)
        }
        else {
          this.cdkey = result?.data?.cdkey
          this.steptag = 'submitinfo'
        }
      } catch (error) {
        this.$message.warning(error?.message)
      }
      this.loading = false
    }, 300)
  }

  handleSubmit (values: Account.register) {
    if (this.accountOptions.invitation) {
      values.invitation = this.cdkey
    }
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await this.$httpClient().POST<HttpResult<UserDocument>>('/api/account/register', values)
        if (result?.error) {
          this.$message.warning(result?.error)
        }
        else {
          this.email = result?.data?.email!
          this.steptag = 'finished'
        }
      } catch (error) {
        this.$message.warning(error?.message)
      }
      this.loading = false
    }, 300)
  }

  /**
   * 查询验证 用户名/邮箱/手机号重名
   */
  async handleUnique (name: string, path: string | null, type: string) {
    let url = `/api/account/check/${type}`
    let values = { name }
    try {
      let result = await this.$httpClient(this.httpOptions).PUT<HttpResult<boolean>>(url, values)
      if (result?.error) {
        return false
      }
      return true
    } catch (error) {
      return true
    }
  }
}
</script>