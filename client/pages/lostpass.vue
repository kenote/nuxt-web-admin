<template>
  <page v-if="steptag === 'start'">
    <account-verifyuser title="找回密码" @submit="handleVerifyUser" >
      <p class="service-terms">
        无法通过以上方式找回密码？ 请
        <a href="javascript:;">联系客服</a>
        <nuxt-link to="/login" class="ng-hide">立即登录</nuxt-link>
      </p>
    </account-verifyuser>
  </page>
  <page v-else-if="steptag === 'submit'">
    <account-lostpass title="找回密码" @submit="handleSubmit" v-loading="loading" :loading="loading">
      <div slot="info" class="codeSent-info">
        <p>验证码已通过手机短信发送给您</p>
        <p>
          没有收到？
          <a v-if="times === 0" href="javascript:;" @click="handleVerifyUser(verifyUser)">重新发送</a>
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
    </account-lostpass>
  </page>
</template>

<script lang="ts">
import { Component, mixins, Provide } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { Account } from '@/types/account'
import { HttpResult } from '@/types/client'

@Component<LostpassPage>({
  name: 'lostpass-page',
  layout: 'account'
})
export default class LostpassPage extends mixins(PageMixin) {

  @Provide()
  steptag: 'start' | 'submit' = 'start'

  @Provide()
  verifyUser: Account.verifyUserRequest = { type: 'email', name: '' }

  /**
   * 验证用户身份
   */
  handleVerifyUser (values: Account.verifyUserRequest) {
    let { type, name } = values
    setTimeout(async () => {
      try {
        let result = await this.$httpClient().put<HttpResult>(`/api/account/sendcode/${type}`, { verify_id: 'resetpwd', name })
        if (result?.error) {
          this.$message.warning(result?.error)
        }
        else {
          let { verify_id } = result?.data
          if (this.steptag === 'start') {
            this.steptag = 'submit'
            this.verifyUser = { ...values, verify_id }
          }
          this.sendWait(this.accountOptions.mailphoneStep)
        }
      } catch (error) {
        this.$message.warning(error?.message)
      }
    }, 300)
  }

  handleSubmit (values: Account.lostpass) {
    let { code, password } = values
    let { type, name, verify_id } = this.verifyUser
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await this.$httpClient().put<HttpResult>(`/api/account/resetpwd/${type}`, { code, password, name, verify_id })
        if (result?.error) {
          this.$message.warning(result?.error)
        }
        else {
          this.$message.info('密码修改成功！')
          this.handleGotoLogin(3000)
        }
      } catch (error) {
        this.$message.error(error.message)
      }
      this.loading = false
    }, 300)
    
  }

  handleGotoStart () {
    this.steptag = 'start'
  }

  handleGotoLogin (time: number = 3000) {
    setTimeout(() => {
      this.$router.push({ path: '/login' })
    }, time)
  }
}
</script>
