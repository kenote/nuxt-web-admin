<template>
  <page>
    <dashboard-breadcrumb :route-path="$route.path" :channel="selectedChannel" />

  </page>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { Channel } from '@/types/channel'

@Component<TeamPage>({
  name: 'team-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class TeamPage extends Vue {

  @Store.Setting.Getter selectedChannel!: Channel.element
  
}
</script>