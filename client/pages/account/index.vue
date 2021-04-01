<template>
  <dashboard>
    
  </dashboard>
</template>

<script lang="ts">
import { Component, mixins, Vue } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'

@Component<HomePage>({
  name: 'homepage',
  middleware: [ 'authenticated' ],
  layout: 'dashboard',
  mounted () {
    
  }
})
export default class HomePage extends mixins(PageMixin) {
  
}
</script>