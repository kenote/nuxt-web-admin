<template>
  <page>
    <client-only placeholder="Page Loading...">
      <slot></slot>
      <div class="page-fixed-tools" v-show="!refresh">
        <el-button type="info" icon="el-icon-message" circle></el-button>
        <el-button type="warning" icon="el-icon-star-off" circle></el-button>
      </div>
      <el-backtop target=".page-main .ps" :visibility-height="60" :bottom="100" :right="20"></el-backtop>
    </client-only>
  </page>
</template>


<script lang="ts">
import { Component, Vue, Prop, Provide, Watch, mixins } from 'nuxt-property-decorator'
import { Channel } from '@/types/client'
import BaseMixin from '~/mixins/base'
import { Store, Types } from '~/store'

@Component<Dashboard>({
  name: 'dashboard',
  mounted () {
    
  }
})
export default class Dashboard extends mixins(BaseMixin) {

  @Store.Setting.State
  refresh!: boolean

  
}
</script>

<style lang="scss" scoped>
.page-fixed-tools {
  position: fixed;
  bottom: 150px;
  right: 20px;
  display: flex;
  flex-direction: column;
  z-index: 4;
  
  * {
    margin: 0;
    margin-top: 8px;
    font-size: 16px;
  }
}
</style>