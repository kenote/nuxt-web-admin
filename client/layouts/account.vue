<template>
  <client-only placeholder="Page Loading...">
    <perfect-scrollbar :options="{ suppressScrollX: true }">
      <div class="warpper">
        <header>
          <nuxt-link to="/">
            <img src="/images/logo.png" height="32" />
          </nuxt-link>
          <div class="list">
            <nuxt-link to="/login">登录</nuxt-link>
            <nuxt-link to="/register">注册</nuxt-link>
            <nuxt-link to="/">首页</nuxt-link>
          </div>
        </header>
        <nuxt class="layout-main"></nuxt>
      </div>
      <footer>
        
      </footer>
    </perfect-scrollbar>
  </client-only>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import BaseMixin from '~/mixins/base'
import { Store } from '~/store'
import { MetaInfo } from 'vue-meta'
import '~/assets/scss/account/warpper.scss'

@Component<AccountLayout>({
  name: 'account-layout',
  head () {
    return { ...this.metaInfo }
  },
  mounted () {
    document.body.className = 'account-body'
  }
})
export default class AccountLayout extends mixins(BaseMixin) {

  @Store.Setting.State
  metaInfo!: MetaInfo
  
}
</script>