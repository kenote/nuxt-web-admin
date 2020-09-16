<template>
  <dashboard-page v-loading="initinal">

  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, mixins, Provide } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'

@Component<ToolsHttpPage>({
  name: 'tools-http-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class ToolsHttpPage extends mixins(PageMixin) {
  
}
</script>