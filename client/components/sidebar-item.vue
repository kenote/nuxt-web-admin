<template>
  <el-submenu v-if="children" :index="index">
    <template slot="title">
      <i v-if="icon" v-bind:class="icon"></i>
      <span>{{ name }}</span>
    </template>
    <template v-for="(item, key) in children">
      <sidebar-item v-if="isFilter(item.conditions)"
        :key="key"
        :name="item.name"
        :icon="item.icon"
        :index="item.route || item.key"
        :disabled="item.disabled"
        :children="item.children"
        :env="env"
        />
    </template>
  </el-submenu>
  <el-menu-item v-else :index="index" :disabled="isDisabled(disabled)">
    <i v-if="icon" v-bind:class="icon"></i>
    <div slot="title">
      <span>{{ name }}</span>
    </div>
  </el-menu-item>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { Channel } from '@/types/client'
import { FilterQuery } from '@kenote/common'
import EnvironmentMixin from '~/mixins/environment'

@Component<SidebarItem>({
  name: 'sidebar-item'
})
export default class SidebarItem extends mixins(EnvironmentMixin) {

  @Prop({ default: '' })
  name!: string

  @Prop({ default: '' })
  icon!: string

  @Prop({ default: '' })
  index!: string 

  @Prop({ default: false })
  disabled!: boolean | FilterQuery<any> | string

  @Prop({ default: undefined })
  children!: Channel.DataNode[]
}

</script>