<template>
  <page v-if="steptag === 'start'">
    <passport-verifyuser :title="'找回密码'" @submit="handleVerifyUser" v-loading="loading" :loading="loading">
      <p class="service-terms">
        无法通过以上方式找回密码？ 请
        <a href="javascript:;">联系客服</a>
        <nuxt-link to="/login" class="ng-hide">立即登录</nuxt-link>
      </p>
    </passport-verifyuser>
  </page>
  <page v-else-if="steptag === 'submit'">
    <passport-lostpass :title="'找回密码'" @submit="handleSubmit" v-loading="loading" :loading="loading">
      <div slot="info" class="codeSent-info">
        <p>验证码已通过手机短信发送给您</p>
        <p>
          没有收到？
          <a v-if="times === 0" href="javascript:;" @click="handleVerifyUser(verifyRequest)">重新发送</a>
          <a v-else href="javascript:;">({{ times }} 秒后)重新发送</a>
           或 
          <a href="javascript:;" @click="handleGotoStart">选择其他方式</a>
        </p>
      </div>
      <p class="service-terms">
        无法通过以上方式找回密码？ 请
        <a href="javascript:;">联系客服</a>
        <a href="javascript:;" @click="handleGotoStart" class="ng-hide">返回</a>
      </p>
    </passport-lostpass>
  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { Register } from '@/types/restful'
import * as PassportAPI from '@/types/apis/passport'
import * as api from '~/api'

@Component<LostpassPage>({
  name: 'lostpass',
  layout: 'passport',
  middleware: ['notauthenticated'],
})
export default class LostpassPage extends Vue {
  
  @Store.Setting.State register!: Register.config

  @Provide() loading: boolean = false
  @Provide() steptag: 'start' | 'submit' = 'start'
  @Provide() verifyRequest: PassportAPI.verifyUserRequest = { type: 'email', name: '' }
  @Provide() times: number = 0

  handleVerifyUser (values: PassportAPI.verifyUserRequest): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.resetpwdCode(values.type, values.name)
        if (result.error === 0) {
          if (this.steptag === 'start') this.steptag = 'submit'
          this.verifyRequest = values
          this.mailPhoneStep()
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

  mailPhoneStep (): void {
    this.times = this.register.mailphone_step
    let timer: NodeJS.Timeout | null = setInterval(() => {
      this.times --
      if (this.times <= 0) {
        clearTimeout(timer!)
        timer = null
      }
    }, 1000)
  }

  handleSubmit (values: PassportAPI.lostpass): void {
    let { code, password } = values
    let { type, name } = this.verifyRequest
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.resetpwd(type, { code, password, name })
        if (result.error === 0) {
          this.$message.info('密码修改成功！')
          this.handleGotoLogin(3000)
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

  handleGotoStart (): void {
    this.steptag = 'start'
  }

  handleGotoLogin (time?: number): void {
    setTimeout(() => {
      this.$router.push({ path: '/login' })
    }, time || 3000)
  }
}
</script>