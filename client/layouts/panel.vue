<template>
  <div>
    <h1>Panel</h1>
    <nuxt></nuxt>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import BaseMixin from '~/mixins/base'

@Component<PanelLayout>({
  name: 'panel-layout'
})
export default class PanelLayout extends mixins(BaseMixin) {
  
}
</script>