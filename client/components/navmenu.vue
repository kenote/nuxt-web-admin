<template>
  <fragment>
    <slot name="prefix"></slot>
    <template v-for="item in data">
      <navmenu-dropdown v-if="item.type === 'dropdown'" 
        :key="item.key" 
        :name="item.name" 
        :classname="classname"
        :trigger="item.trigger"
        :data="item.data" 
        @command="handleCommand" 
        />
      <notification v-else-if="item.type === 'notification'" 
        :key="item.key" 
        :name="item.name"
        :trigger="item.trigger"
        :classname="classname"
        :data="(notification || item.data || []).map(parseProps(item.props))"
        :more="item.more"
        :date-format="item.dateFormat"
        @command="handleCommand"
        />
      <div v-else 
        :key="item.key" 
        v-bind:class="classname" 
        @click="handleCommand(item.link)">
        <i v-if="/^(iconfont|el-icon)/.test(item.name)" v-bind:class="item.name"></i>
        <template v-else>{{ item.name }}</template>
      </div>
    </template>
    <slot name="suffix"></slot>
  </fragment>
</template>

<script lang="ts">
import { Component, mixins, Prop, Provide, Emit, Watch } from 'nuxt-property-decorator'
import BaseMixin from '~/mixins/base'
import { NavMenu } from '@/types/client'

@Component<Navmenu>({
  name: 'navmenu',
})
export default class Navmenu extends mixins(BaseMixin) {

  @Prop({ default: [] })
  data!: NavMenu.RootDataItem[]

  @Prop({ default: 'header-link' })
  classname!: string

  @Prop({ default: undefined })
  notification!: Record<string, any>[]

  @Emit('command')
  handleCommand (value: string) {}
}
</script>