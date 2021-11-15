<template>
  <div v-loading="loading" element-loading-text="邮箱校验中 ..." element-loading-spinner="el-icon-loading" class="all-landing-body">
    <transition name="el-fade-in">
      <div class="landing-body verify-result" v-if="!loading">
        <div class="verify-result-box" v-bind:class="status">
          <i :class="icon"></i>
          <div class="verify-result-content">
            <h1>{{ message }}</h1>
            <nuxt-link to="/">返回首页</nuxt-link>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Provide } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { Account } from '@/types/account'
import { HttpResult } from '@/types/client'
import { get } from 'lodash'

const icons = {
  success   : 'el-icon-success',
  warning   : 'el-icon-warning',
  error     : 'el-icon-error'
}

@Component<EmailVerifyPage>({
  name: 'email-verify-page',
  layout: 'account',
  created () {
    let { token, _id } = this.$route.query as Account.verifyEmailMobile
    this.handleVerifyEmail({ token, _id })
  }
})
export default class EmailVerifyPage extends mixins(PageMixin) {

  @Provide() 
  message?: string = ''

  @Provide() 
  status: string = 'warning'

  @Provide() 
  icon?: string = icons['warning']
  
  handleVerifyEmail (values: Account.verifyEmailMobile) {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await this.$httpClient().PUT<HttpResult>(`/api/account/verify/email`, values)
        if (result?.error) {
          this.message = result.error
          this.status = 'warning'
          this.icon = icons['warning']
        }
        else {
          this.message = '邮箱验证通过'
          this.status = 'success'
          this.icon = icons['success']
        }
      } catch (error) {
        this.message = get(error, 'message')
        this.status = 'error'
        this.icon = icons['error']
      }
      this.loading = false
    }, 300)
  }
}
</script>

<style lang="scss" scoped>
.all-landing-body {
  width: 100%!important;
  height: 100%;
  position: absolute!important;
  bottom: 0;
}
.verify-result {
  margin-top: 130px!important;
  background-color: #ffffffc4!important;
  max-width: 500px;
}
</style>