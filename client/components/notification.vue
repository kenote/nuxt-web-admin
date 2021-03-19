<template>
  <el-dropdown :trigger="trigger" @visible-change="handleVisible" @command="handleCommand">
    <a v-bind:class="classname + ' ' + (visible ? 'active' : '')">
      <span class="el-dropdown-link">
        <el-badge is-dot v-if="data.length > 0">
          <i class="el-icon-message-solid"></i>
        </el-badge>
        <i v-else class="el-icon-message-solid"></i>
      </span>
    </a>
    <el-dropdown-menu slot="dropdown" v-bind:class="`${classname}-dropdown`">
      <div v-bind:class="`${classname}-dropdown-notification`">
        <h3><span>{{ name }}</span></h3>
        <el-dropdown-item v-for="item in data" :key="item.key" :command="item.command">
          <span>{{ item.title }}</span>
          <time>{{ item.time }}</time>
        </el-dropdown-item>
      </div>
      <el-dropdown-item divided class="end" :command="moreInfo('link')">{{ moreInfo('name') }}</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script lang="ts">
import { Component, mixins, Prop, Provide, Emit, Watch } from 'nuxt-property-decorator'
import BaseMixin from '~/mixins/base'
import { NavMenu } from '@/types/client'


interface DataItem {
  key         ?: string
  title        : string
  time        ?: string
  command      : string
}

@Component<Notification>({
  name: 'notification',
})
export default class Notification extends mixins(BaseMixin) {

  @Prop({ default: undefined })
  name!: string

  @Prop({ default: [] })
  data!: DataItem[]

  @Prop({ default: 'hover' })
  trigger!: 'hover' | 'click'

  @Prop({ default: undefined })
  classname!: string

  @Prop({ default: undefined })
  more!: NavMenu.MoreItem

  @Provide()
  visible: boolean = false

  handleVisible (visible: boolean) {
    this.visible = visible
  }

  @Emit('command')
  handleCommand (value: string) {}

  moreInfo (tag: 'name' | 'link') {
    // { name: 'More', link: 'command:notification/list' }
    let info = { name: 'More', link: 'command:notification/list', ...this.more }
    return info[tag]
  }

}
</script>