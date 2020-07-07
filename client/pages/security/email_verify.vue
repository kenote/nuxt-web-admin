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
import { Component, Vue, Provide } from 'nuxt-property-decorator'
import * as api from '~/api'
import * as PassportAPI  from '@/types/apis/passport'

const icons = {
  success   : 'el-icon-success',
  warning   : 'el-icon-warning',
  error     : 'el-icon-error'
}

@Component<EmailVerifyPage>({
  name: 'email-verify-page',
  layout: 'passport',
  created () {
    let { token, id } = this.$route.query
    this.handleVerifyEmail({ token: token as string, id: id as string })
  }
})
export default class EmailVerifyPage extends Vue {

  @Provide() loading: boolean = false
  @Provide() message?: string = ''
  @Provide() status: string = 'warning'
  @Provide() icon?: string = ''

  handleVerifyEmail (values: PassportAPI.verifyBaseDocument): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.verify_email_mobile(values, 'email')
        this.message = result.error === 0 ? '邮箱验证通过' : result.message
        if (result.error === 0) {
          this.message = '邮箱验证通过'
          this.status = 'success'
        }
        else {
          this.message = result.message
          this.status = result.data
        }
        this.icon = icons[this.status]
      } catch (error) {
        this.$message.warning(error.message)
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
}
</style>