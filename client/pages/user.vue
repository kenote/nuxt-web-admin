<template>
  <page>
    <h1>User page</h1>
  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'nuxt-property-decorator'

@Component<R>({
  layout: 'homepage',
  middleware: 'authenticated'
})
export default class R extends Vue {

}
</script>