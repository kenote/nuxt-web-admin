<template>
  <page>
    Home Page 
    <p>site_url: {{ site_url }}</p>
    <el-button>TEST</el-button>
    <nuxt-link to="/panel">Panel</nuxt-link>
  </page>
</template>

<script lang="ts">
import { Component, mixins, Vue } from 'nuxt-property-decorator'
import BaseMixin from '~/mixins/base'

@Component<HomePage>({
  name: 'home-page',
  // middleware: [ 'authenticated' ],
  layout: 'panel'
})
export default class HomePage extends mixins(BaseMixin) {
  
}
</script>