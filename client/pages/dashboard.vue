<template>
  <dashboard v-loading="initinal">
    
  </dashboard>
</template>

<script lang="ts">
import { Component, mixins, Vue } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'

@Component<DashboardHomePage>({
  name: 'dashboard-homepage',
  middleware: [ 'authenticated' ],
  layout: 'dashboard',
  mounted () {
    
  }
})
export default class DashboardHomePage extends mixins(PageMixin) {
  
}
</script>