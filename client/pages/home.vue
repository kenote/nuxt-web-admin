<template>
  <div>
    Home Page 
    <p>site_url: {{ site_url }}</p>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Vue } from 'nuxt-property-decorator'
import BaseMixin from '~/mixins/base'

@Component<HomePage>({
  name: 'home-page',
  middleware: [ 'authenticated' ],
  layout: 'panel'
})
export default class HomePage extends mixins(BaseMixin) {
  
}
</script>