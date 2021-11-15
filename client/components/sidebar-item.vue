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
        :tag="item.tag"
        :index="item.route || item.key"
        :disabled="item.disabled"
        :children="item.children"
        :access="access"
        :ignore-platform="ignorePlatform"
        :platform="platform"
        :env="env"
        />
    </template>
  </el-submenu>
  <el-menu-item v-else :index="index" :disabled="accessDisabled(index)">
    <i v-if="icon" v-bind:class="icon"></i>
    <div slot="title">
      <span>{{ name }}</span>
    </div>
    <el-tag v-if="tag" style="float:right;margin-top:9px" effect="dark">{{ tag }}</el-tag>
  </el-menu-item>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { Channel } from '@/types/client'
import { FilterQuery } from '@kenote/common'
import EnvironmentMixin from '~/mixins/environment'
import { get } from 'lodash'

@Component<SidebarItem>({
  name: 'sidebar-item'
})
export default class SidebarItem extends mixins(EnvironmentMixin) {

  @Prop({ default: '' })
  name!: string

  @Prop({ default: '' })
  icon!: string

  @Prop({ default: '' })
  tag!: string

  @Prop({ default: '' })
  index!: string 

  @Prop({ default: false })
  disabled!: boolean | FilterQuery<any> | string

  @Prop({ default: undefined })
  access!: string[]

  @Prop({ default: undefined })
  ignorePlatform!: string[]

  @Prop({ default: '' })
  platform!: string

  @Prop({ default: undefined })
  children!: Channel.DataNode[]

  accessDisabled (routePath: string) {
    let disabled = this.isDisabled(this.disabled)
    if (disabled) return disabled
    let level = get(this.env, 'auth.group.level', 0)
    if (level >= 9000) return false
    if (this.ignorePlatform?.includes(this.platform)) return
    return !this.access?.includes(routePath)
  }
}

</script>