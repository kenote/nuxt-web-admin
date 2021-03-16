<template>
  <client-only placeholder="Page Loading...">
    <fragment>
      <div class="warpper">
        <header>
          <nuxt-link to="/">
            <img src="/images/logo.png" height="32" />
          </nuxt-link>
          <div class="list">
            <nuxt-link to="/login">文档中心</nuxt-link>
            <nuxt-link to="/">首页</nuxt-link>
          </div>
        </header>
        <nuxt class="layout-main"></nuxt>
      </div>
      <footer>
        
      </footer>
    </fragment>
  </client-only>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import BaseMixin from '~/mixins/base'
import '~/assets/scss/account/warpper.scss'

@Component<AccountLayout>({
  name: 'account-layout',
  mounted () {
    document.body.className = 'account-body'
  }
})
export default class AccountLayout extends mixins(BaseMixin) {
  
}
</script>