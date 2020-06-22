<template>
  <page>
    <dashboard-breadcrumb :route-path="$route.path" :channel="selectedChannel" />

  </page>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { Channel } from '@/types/channel'

@Component<UserPage>({
  name: 'user-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class UserPage extends Vue {

  @Store.Setting.Getter selectedChannel!: Channel.element
  
}
</script>