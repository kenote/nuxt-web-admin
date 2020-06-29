<template>
  <dashboard-page v-loading="initinal">

  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, Provide, mixins } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'

@Component<UserPage>({
  name: 'user-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class UserPage extends mixins(PageMixin) {
  
}
</script>