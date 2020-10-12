<template>
  <page>

  </page>
</template>

<script lang="ts">
import { Component, Vue, mixins } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { Route } from 'vue-router'

@Component<DashboardPage>({
  name: 'dashboard-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class DashboardPage extends mixins(PageMixin) {
  
}
</script>