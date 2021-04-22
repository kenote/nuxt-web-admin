<template>
  <page>
    <account-verifyuser title="找回密码" @submit="handleVerifyUser" >
      <p class="service-terms">
        无法通过以上方式找回密码？ 请
        <a href="javascript:;">联系客服</a>
        <nuxt-link to="/login" class="ng-hide">立即登录</nuxt-link>
      </p>
    </account-verifyuser>
  </page>
</template>

<script lang="ts">
import { Component, mixins, Provide, Watch } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { Account } from '@/types/account'

@Component<LostpassPage>({
  name: 'lostpass-page',
  layout: 'account'
})
export default class LostpassPage extends mixins(PageMixin) {

  handleVerifyUser (values: Account.verifyUserRequest) {
    console.log(values)
  }
}
</script>
