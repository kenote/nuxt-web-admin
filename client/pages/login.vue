<template>
  <page>
    <div class="landing-activity" v-if="activitys.length > 0">
      <el-carousel height="180px" indicator-position="outside" arrow="never" v-if="activitys.length > 1">
        <el-carousel-item v-for="(activity, key) in activitys" :key="key">
          <p v-for="(item, i) in activity.main_title" :key="i" class="main-title">{{ item }}</p>
          <p class="secondary-title">{{ activity.secondary_title }}</p>
        </el-carousel-item>
      </el-carousel>
      <fragment v-else >
        <p v-for="(item, key) in activitys[0].main_title" :key="key" class="main-title">{{ item }}</p>
        <p class="secondary-title">{{ activitys[0].secondary_title }}</p>
      </fragment>
    </div>
    <passport-login @submit="handleSubmit" v-loading="loading" :loading="loading">
      <p class="service-terms">
        <nuxt-link to="/lostpass">忘记密码</nuxt-link>
        <nuxt-link to="/register" class="ng-hide">立即注册</nuxt-link>
      </p>
    </passport-login>
  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { Register, SinglePage } from '@/types/restful'
import { oc } from 'ts-optchain'
import * as PassportAPI from '@/types/apis/passport'
import * as api from '~/api'
import * as auth from '~/store/modules/auth'

@Component<LoginPage>({
  name: 'login-page',
  layout: 'passport',
  middleware: ['notauthenticated'],
  created () {
    this.activitys = oc(this.singlepages.find( o => o.key === 'login' )).activitys([])
  }
})
export default class LoginPage extends Vue {

  @Store.Setting.State register!: Register.config
  @Store.Setting.State singlepages!: SinglePage.item[]

  @Provide() activitys: SinglePage.activity[] =[]
  @Provide() loading: boolean = false

  handleSubmit (values: PassportAPI.login): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.login(values)
        if (result.error === 0) {
          let { url_callback } = this.$route.query
          this.$store.commit(`${auth.name}/${auth.types.AUTH}`, result.data)
          this.$router.push(url_callback as string || '/dashboard')
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