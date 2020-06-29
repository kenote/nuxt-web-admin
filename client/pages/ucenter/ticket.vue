<template>
  <dashboard-page v-loading="initinal">

  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, Provide, mixins } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'

@Component<TicketPage>({
  name: 'ticket-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class TicketPage extends mixins(PageMixin) {
  
}
</script>