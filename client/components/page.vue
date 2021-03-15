<template>
  <main>
    <slot></slot>
    <slot name="footer"></slot>
  </main>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component<Page>({
  name: 'page',
  mounted () {
    this.$nextTick(() => {
      this.$nuxt.$loading.start()
      setTimeout(() => this.$nuxt.$loading.finish(), 300)
    })
  }
})
export default class Page extends Vue {}
</script>