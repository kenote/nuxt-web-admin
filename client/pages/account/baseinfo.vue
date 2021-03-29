<template>
  <page>
    
  </page>
</template>

<script lang="ts">
import { Component, mixins, Vue } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'

@Component<BaseInfoPage>({
  name: 'baseinfo-page',
  middleware: [ 'authenticated' ],
  layout: 'dashboard',
  mounted () {
    
  }
})
export default class BaseInfoPage extends mixins(PageMixin) {
  
}
</script>