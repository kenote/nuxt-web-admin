<template>
  <page>
    
  </page>
</template>

<script lang="ts">
import { Component, mixins, Vue } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'

@Component<DashboardHomePage>({
  name: 'dashboard-homepage',
  middleware: [ 'authenticated' ],
  layout: 'dashboard'
})
export default class DashboardHomePage extends mixins(PageMixin) {
  
}
</script>