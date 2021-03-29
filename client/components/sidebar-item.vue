<template>
  <el-submenu v-if="children" :index="index">
    <template slot="title">
      <i v-if="icon" v-bind:class="icon"></i>
      <span>{{ name }}</span>
    </template>
    <template v-for="(item, key) in children">
      <sidebar-item
        :key="key"
        :name="item.name"
        :icon="item.icon"
        :index="item.route || item.key"
        :children="item.children"
        />
    </template>
  </el-submenu>
  <el-menu-item v-else :index="index">
    <i v-if="icon" v-bind:class="icon"></i>
    <div slot="title">
      <span>{{ name }}</span>
    </div>
  </el-menu-item>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch, Emit } from 'nuxt-property-decorator'
import { get } from 'lodash'
import { Channel } from '@/types/client'


@Component<SidebarItem>({
  name: 'sidebar-item',
  created () {
    
  }
})
export default class SidebarItem extends Vue {

  @Prop({ default: '' })
  name!: string

  @Prop({ default: '' })
  icon!: string

  @Prop({ default: '' })
  index!: string 

  @Prop({ default: undefined })
  children!: Channel.DataNode[]
}

</script>