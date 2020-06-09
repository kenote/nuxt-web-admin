<template>
  <header>
    <div class="header-start">
      <div class="header-link-box">
        <nuxt-link class="header-link logo" to="/dashboard">
          <img src="~/assets/images/logo.png" style="height:24px" />
        </nuxt-link>
      </div>
      <el-dropdown placement="top-start" trigger="click" @visible-change="handleVisible" @command="handlePlatform">
        <a class="header-link" v-bind:class="visible ? 'active' : ''">
          <span class="el-dropdown-link">
            <i class="el-icon-menu el-icon--left"></i>{{ currentChannel.name }}
          </span>
        </a>
        <el-dropdown-menu slot="dropdown" class="header-link-dropdown">
          <template v-for="(channel, key) in platforms">
            <el-dropdown-item v-if="channel.id === 1001" :key="key+1000" divided></el-dropdown-item>
            <el-dropdown-item :key="key" :command="channel.id">[{{ channel.id }}] {{ channel.name }}</el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="header-end">
      <slot></slot>
    </div>
  </header>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Emit } from 'nuxt-property-decorator'
import { Channel } from '@/types/channel'

@Component<DashboardHeader>({
  name: 'dashboard-header'
})
export default class DashboardHeader extends Vue {

  @Prop({ default: [] }) platforms!: Channel.element[]
  @Prop({ default: { id: 0, name: '仪表盘' } }) currentChannel!: Channel.element

  @Provide() visible: boolean = false

  @Emit('change-platform')
  handlePlatform (channelId: number): void {
    
  }

  handleVisible (visible: boolean): void {
    this.visible = visible
  }
}
</script>