<template>
  <page>
    <account-ticket title="邀请码" @submit="handleInvitation">
      <p class="service-terms">
        系统已经关闭的注册入口，您必须拥有邀请码才能注册
      </p>
    </account-ticket>
  </page>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { Account } from '@/types/account'

@Component<RegisterPage>({
  name: 'register-page',
  layout: 'account'
})
export default class RegisterPage extends mixins(PageMixin) {
  

  handleInvitation (values: Account.ticket) {
    console.log(values)// 269bbd97-645f-409d-9566-aa5d27c08b19
  }
}
</script>