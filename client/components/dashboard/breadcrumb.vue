<template>
  <el-breadcrumb separator="/">
    <template v-if="breadcrumb">
      <el-breadcrumb-item v-for="(item, key) in breadcrumb" :key="key">{{ item.name }}</el-breadcrumb-item>
    </template>
  </el-breadcrumb>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { Channel } from '@/types/channel'
import { Route } from 'vue-router'
import { Navigation, Channel as IChannel } from 'kenote-config-helper'
import { oc } from 'ts-optchain'

@Component<DashboardBreadcrumb>({
  name: 'dashboard-breadcrumb',
  created () {
    this.updateBreadcrumb(this.channel)
  }
})
export default class DashboardBreadcrumb extends Vue {

  @Prop({ default: undefined }) channel!: Channel.element
  @Prop({ default: undefined }) routePath!: string

  @Provide() breadcrumb: Navigation[] = []

  @Watch('channel')
  onChannelChange (val: Channel.element, oldVal: Channel.element): void {
    this.updateBreadcrumb(val)
  }

  updateBreadcrumb (channel: Channel.element): void {
    let breadcrumb: Navigation[] = []
    if (channel) {
      breadcrumb.push({ name: channel.name, index: channel.default! })
      if (this.routePath) {
        let _channel = JSON.parse(JSON.stringify(channel))
        let menu = new IChannel(_channel).find(this.routePath)
        if (oc(menu).maps()) {
          breadcrumb = [ ...breadcrumb, ...menu?.maps! ]
        }
      }
    }
    this.breadcrumb = breadcrumb
  }
  
}
</script>