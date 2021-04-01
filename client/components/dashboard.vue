<template>
  <page>
    <client-only placeholder="Page Loading...">
      <slot></slot>
    </client-only>
  </page>
</template>


<script lang="ts">
import { Component, Vue, Prop, Provide, Watch, mixins } from 'nuxt-property-decorator'
import { Channel } from '@/types/client'
import BaseMixin from '~/mixins/base'

@Component<Dashboard>({
  name: 'dashboard',
  mounted () {
    
  }
})
export default class Dashboard extends mixins(BaseMixin) {

  
}
</script>