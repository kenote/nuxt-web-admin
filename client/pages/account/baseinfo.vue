<template>
  <dashboard-page v-loading="initinal">

  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, Provide, mixins } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'

@Component<BaseinfoPage>({
  name: 'baseinfo-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class BaseinfoPage extends mixins(PageMixin) {
  
}
</script>