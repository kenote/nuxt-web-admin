<template>
  <el-dropdown :trigger="trigger" @visible-change="handleVisible" @command="handleCommand">
    <a v-bind:class="classname + ' ' + (visible ? 'active' : '')">
      <span class="el-dropdown-link">
        <i v-if="/^(iconfont|el-icon)/.test(name)" v-bind:class="name"></i>
        <template v-else>{{ name }}</template>
      </span>
    </a>
    <el-dropdown-menu slot="dropdown" v-bind:class="`${classname}-dropdown`">
      <el-dropdown-item v-for="(item, key) in data" :key="item.key || key" :command="item.link">{{item.name}}</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script lang="ts">
import { Component, mixins, Prop, Provide, Emit, Watch } from 'nuxt-property-decorator'
import BaseMixin from '~/mixins/base'

@Component<NavmenuIDropdown>({
  name: 'navmenu-dropdown',
})
export default class NavmenuIDropdown extends mixins(BaseMixin) {

  @Prop({ default: undefined })
  name!: string

  @Prop({})
  data!: Array<{ command: string, name: string }>

  @Prop({ default: 'hover' })
  trigger!: 'hover' | 'click'

  @Prop({ default: undefined })
  classname!: string

  @Provide()
  visible: boolean = false

  handleVisible (visible: boolean) {
    this.visible = visible
  }

  @Emit('command')
  handleCommand (value: string) {}

}
</script>