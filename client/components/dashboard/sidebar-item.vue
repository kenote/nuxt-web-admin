<template>
  <el-submenu v-if="children && children.length > 0 && !/^(\/)/.test(index)" 
    :index="index || ''" 
    :disabled="subDisabled" 
    v-show="disableMode === 'disable' ? true : !subDisabled" >
    <template slot="title">
      <i v-if="icon" v-bind:class="icon"></i>
      <span>{{ name }}</span>
    </template>
    <template v-for="(menu, key) in  children">
      <dashboard-sidebar-item :key="key"
        :index="menu.index"
        :name="menu.name"
        :icon="menu.icon"
        :children="menu.children"
        :disabled="menu.disabled"
        :disable-mode="disableMode"
        v-show="disableMode === 'disable' ? true : !menu.disabled"
        />
    </template>
  </el-submenu>
  <el-menu-item v-else :index="index" :disabled="disabled">
    <i v-if="icon" v-bind:class="icon"></i>
    <span slot="title">{{ name }}</span>
  </el-menu-item>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from 'nuxt-property-decorator'
import { Sidebar } from '@/types'

@Component<DashboardSidebarItem>({
  name: 'dashboard-sidebar-item',
  created () {
    if (this.children) {
      this.subDisabled = !this.children.find( o => !o.disabled )
    }
  }
})
export default class DashboardSidebarItem extends Vue {

  @Prop({ default: '' }) name!: string
  @Prop({ default: '' }) index!: string
  @Prop({ default: '' }) icon!: string
  @Prop({ default: undefined }) children!: Sidebar.menuItem[]
  @Prop({ default: false }) disabled!: boolean
  @Prop({ default: 'disable' }) disableMode!: 'hide' | 'disable'

  @Provide() subDisabled: boolean = false
  
}
</script>