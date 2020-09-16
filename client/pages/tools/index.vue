<template>
  <dashboard-page v-loading="initinal">

  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, mixins, Provide } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'

@Component<ToolsPage>({
  name: 'tools-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class ToolsPage extends mixins(PageMixin) {
  
}
</script>