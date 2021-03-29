<template>
  <page>
    
  </page>
</template>

<script lang="ts">
import { Component, mixins, Vue } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'

@Component<AutoPage>({
  name: 'auto-page',
  middleware: [ 'authenticated' ],
  layout: 'dashboard',
  mounted () {
    
  }
})
export default class AutoPage extends mixins(PageMixin) {
  
}
</script>