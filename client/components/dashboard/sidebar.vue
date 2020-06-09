<template>
  <el-menu :default-active="defaultActive" 
    :router="router" 
    :background-color="backgroundColor"
    :text-color="textColor"
    :active-text-color="activeTextColor"
    :unique-opened="true" 
    :collapse="collapse">
    <dashboard-sidebar-item v-for="(menu, key) in navs"
      :key="key"
      :name="menu.name" 
      :icon="menu.icon" 
      :index="menu.index" 
      :children="menu.children" 
      :disabled="menu.disabled"
      :disable-mode="disableMode"
      />
  </el-menu>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { Navigation } from 'kenote-config-helper'

@Component<DashboardSidebar>({
  name: 'dashboard-sidebar'
})
export default class DashboardSidebar extends Vue {

  @Prop({ default: [] }) navs!: Navigation[]
  @Prop({ default: false }) router!: boolean
  @Prop({ default: '' }) defaultActive!: string
  @Prop({ default: 'disable' }) disableMode!: 'hide' | 'disable'
  @Prop({ default: undefined }) backgroundColor!: string
  @Prop({ default: undefined }) textColor!: string
  @Prop({ default: undefined }) activeTextColor!: string
  @Prop({ default: false }) collapse!: boolean
  
}
</script>