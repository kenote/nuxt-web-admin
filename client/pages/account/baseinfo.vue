<template>
  <page>

  </page>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component<BaseinfoPage>({
  name: 'baseinfo-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class BaseinfoPage extends Vue {
  
}
</script>