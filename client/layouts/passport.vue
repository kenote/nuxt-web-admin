<template>
  <div class="passport_warpper">
    <!-- Header -->
    <div class="layout-header">
      <div class="layout-header-warpper">
        <div class="header_pc">
          <nuxt-link to="/">
            <img src="~/assets/images/logo.png" height="32" />
          </nuxt-link>
          <div class="list">
            <nuxt-link to="/">文档中心</nuxt-link>
            <template v-if="auth">
              <nuxt-link class="console" to="/console">控制台</nuxt-link>
            </template>
            <template v-else>
              <nuxt-link to="/login">登录</nuxt-link>
            </template>
            <nuxt-link to="/">首页</nuxt-link>
          </div>
        </div>
        <div class="header_mobile">
          <span>{{ title }}</span>
        </div>
        <!-- Main -->
        <nuxt class="layout-body" />
      </div>
    </div>
    <!-- Footer -->
    <div class="layout-footer">
      <div class="container top">
        <div class="left">
          
        </div>
        <div class="right">
          
        </div>
      </div>
      <div class="line"></div>
      <div class="icp">
        © 2019 Kenote 前端实验室
      </div>
    </div>
    <div class="layout-footer-mobile">
      © 2019 Kenote 前端实验室
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch, mixins } from 'nuxt-property-decorator'
import '~/assets/scss/passport/warpper.scss'
import { Store } from '~/store'
import { ResponseUserDocument } from '@/types/proxys/user'
import { Register } from '@/types/restful'
import { Route } from 'vue-router'
import LayoutMixin from '~/mixins/layout'

@Component<PassportLayout>({
  name: 'passport-layout',
  created () {
    this.updatePageTitle(this.$route.path)
  },
  mounted () {
    document.body.className = 'passport_body'
  }
})
export default class PassportLayout extends mixins(LayoutMixin) {

  @Store.Setting.State register!: Register.config

  @Provide() title: string = ''

  @Watch('$route')
  onRouteChange (val: Route, oldVal: Route): void {
    this.updatePageTitle(val.path)
  }

  updatePageTitle (routerPath: string): void {
    let { page_title } = this.register
    this.title = page_title[routerPath]
  }
}
</script>

<style lang="scss">
.layout-body {
  width: 1170px;
}
</style>