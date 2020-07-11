<template>
  <dashboard-page v-loading="initinal">

  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, mixins } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'

@Component<SettingPage>({
  name: 'setting-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class SettingPage extends mixins(PageMixin) {
  
}
</script>