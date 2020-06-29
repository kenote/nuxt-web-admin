<template>
  <page>
    <dashboard-breadcrumb :route-path="$route.path" :channel="selectedChannel" />
    <slot></slot>
  </page>
</template>

<script lang="ts">
import { Component, Vue, mixins } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { Channel } from '@/types/channel'

@Component<DashboardPage>({
  name: 'dashboard-page'
})
export default class DashboardPage extends Vue {
  
  @Store.Setting.Getter selectedChannel!: Channel.element
}
</script>