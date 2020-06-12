<template>
  <page>
    <h1>Home page 🚀</h1>
  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide, namespace } from 'nuxt-property-decorator'

@Component<HomePage>({
  layout: 'homepage'
})
export default class HomePage extends Vue {

}
</script>