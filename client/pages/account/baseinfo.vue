<template>
  <page>
    <dashboard-breadcrumb :route-path="$route.path" :channel="selectedChannel" />

  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { Channel } from '@/types/channel'

@Component<BaseinfoPage>({
  name: 'baseinfo-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class BaseinfoPage extends Vue {

  @Store.Setting.Getter selectedChannel!: Channel.element

}
</script>