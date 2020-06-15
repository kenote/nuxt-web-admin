<template>
  <page v-if="steptag === 'invitation'">
    <passport-ticket name="邀请码" @submit="handleInvitation" v-loading="loading" :loading="loading">
      <p class="service-terms">
        系统已经关闭的注册入口，您必须拥有邀请码才能注册
      </p>
    </passport-ticket>
  </page>
  <page v-else-if="steptag === 'submitinfo'">
    <passport-register @submit="handleSubmit" v-loading="loading" :loading="loading" :unique="handleUnique">
      <p class="service-terms">
        请您仔细阅读并同意遵守
        <a href="javascript:;">《服务条款》</a>
        <nuxt-link to="/login" class="ng-hide">立即登录</nuxt-link>
      </p>
    </passport-register>
  </page>
  <page v-else-if="steptag ==='finished'">
    <div class="landing-body">
      <h3>注册成功</h3>
      <h5>验证邮件已发送至您的注册邮箱</h5>
      <div class="content" style="text-align: center;">
        <p>请在 {{ register.email_verify.timeout / 3600 }} 小时内进行邮箱验证</p>
        <p>您还可以操作，<nuxt-link to="/">登录后台</nuxt-link></p>
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
import { Component, Vue, Provide } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { Register } from '@/types/restful'
import { ResponseTicketDocument } from '@/types/proxys/ticket'
import { ResponseUserDocument } from '@/types/proxys/user'
import * as PassportAPI from '@/types/apis/passport'
import * as api from '~/api'

@Component<RegisterPage>({
  name: 'register-page',
  layout: 'passport',
  middleware: ['notauthenticated'],
})
export default class RegisterPage extends Vue {
  
  @Store.Setting.State register!: Register.config

  @Provide() loading: boolean = false
  @Provide() steptag: 'invitation' | 'submitinfo' | 'finished' = 'invitation'
  @Provide() cdkey: string = ''
  @Provide() email: string = ''

  handleInvitation (values: PassportAPI.ticket): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.invitation(values.cdkey!)
        if (result.error === 0) {
          let { cdkey } = result.data as ResponseTicketDocument
          this,cdkey = cdkey
          this.steptag = 'submitinfo'
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
      this.loading = false
    }, 300)
  }

  async handleUnique (name: string, type: PassportAPI.checkUserType): Promise<boolean | undefined> {
    try {
      let result = await api.check(name, type)
      if (result.error === 0) {
        return result.data as boolean
      }
      return false
    } catch (error) {
      this.$message.warning(error.message)
    }
  }

  handleSubmit (values: PassportAPI.registerDocument) {
    if (this.register.invitation) {
      values.invitation = this.cdkey
    }
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.register(values)
        if (result.error === 0) {
          let { email } = result.data as ResponseUserDocument
          this.email = email
          this.steptag = 'finished'
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
      this.loading = false
    }, 300)
  }
  
}
</script>