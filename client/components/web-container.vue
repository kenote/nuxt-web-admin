<template>
  <div class="auto-container" v-bind:class="layout">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component<WebContainer>({
  name: 'web-container'
})
export default class WebContainer extends Vue {
  
  @Prop({ default: 'vertical' })
  layout!: string
}
</script>