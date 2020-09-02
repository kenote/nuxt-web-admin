<template>
  <page>
    <client-only placeholder="Page Loading...">
      <dashboard-breadcrumb :route-path="$route.path" :channel="selectedChannel" />
      <slot></slot>
      <div class="dashboard-fixed-tools">
        <el-button type="info" icon="el-icon-message" circle></el-button>
        <el-button type="danger" icon="el-icon-star-on" circle></el-button>
      </div>
      <el-backtop target=".dashboard-page" :visibility-height="60" :bottom="100" :right="20"></el-backtop>
    </client-only>
  </page>
</template>

<script lang="ts">
import { Component, Vue, mixins } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { Channel } from '@/types/channel'

@Component<DashboardPage>({
  name: 'dashboard-page',
  mounted () {
    
  }
})
export default class DashboardPage extends Vue {
  
  @Store.Setting.Getter selectedChannel!: Channel.element
}
</script>

<style lang="scss" scoped>
.dashboard-fixed-tools {
  position: fixed;
  bottom: 150px;
  right: 20px;
  display: flex;
  flex-direction: column;
  
  * {
    margin: 0;
    margin-top: 8px;
    font-size: 16px;
  }
}
</style>