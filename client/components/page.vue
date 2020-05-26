<template>
  <main>
    <slot></slot>
  </main>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'nuxt-property-decorator'

@Component<R>({
  name: 'page',
  mounted () {
    this.$nextTick(() => {
      this.$nuxt.$loading.start()
      setTimeout(() => this.$nuxt.$loading.finish(), 300)
    })
  }
})
export default class R extends Vue {}
</script>