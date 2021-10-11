<template>
  <page>
    
  </page>
</template>

<script lang="ts">
import { Component, mixins, Vue } from 'nuxt-property-decorator'
import BaseMixin from '~/mixins/base'

@Component<HomePage>({
  name: 'home-page',
  // middleware: [ 'authenticated' ],
  // layout: 'panel'
  layout: 'account',
})
export default class HomePage extends mixins(BaseMixin) {
  
}
</script>