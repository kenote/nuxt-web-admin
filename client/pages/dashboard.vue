<template>
  <page>

  </page>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Route } from 'vue-router'

@Component<DashboardPage>({
  name: 'dashboard-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class DashboardPage extends Vue {
  
}
</script>