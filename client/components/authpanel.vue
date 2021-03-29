<template>
  <el-dropdown :trigger="options.trigger" @visible-change="handleVisible" @command="handleCommand">
    <a class="header-link" style="padding:0 15px;" v-bind:class="visible ? 'active' : ''">
      <span class="el-dropdown-link">
        <el-avatar icon="el-icon-user-solid" size="small" :src="avatar"></el-avatar>
      </span>
    </a>
    <el-dropdown-menu slot="dropdown" class="header-link-dropdown">
      <div class="header-link-dropdown-head">
        <h3><span>{{ auth && auth.username || '' }}</span></h3>
        <el-row v-if="options.top">
          <template v-for="(item, key) in options.top">
            <el-col v-if="key < 3" :key="item.key || key" :span="8">
              <el-dropdown-item :command="item.link">{{ item.name }}</el-dropdown-item>
            </el-col>
          </template>
        </el-row>
      </div>
      <template v-if="options.main">
        <el-dropdown-item divided></el-dropdown-item>
        <template v-for="(item, key) in options.main">
          <el-dropdown-item v-if="key < 5" :key="item.key || key" :command="item.link">
            {{ item.name }}
            <template v-if="item.buttons">
              <template v-for="(btn, k) in item.buttons">
                <el-button v-if="key < 3" :key="btn.key || k" size="mini" @click="evt => handleButton(evt, btn.link)">{{ btn.name }}</el-button>
              </template>
            </template>
          </el-dropdown-item>
        </template>
      </template>
      <el-dropdown-item v-if="options.exit" divided class="end" :command="options.exit.link">{{ options.exit.name }}</el-dropdown-item>
      <el-dropdown-item v-else divided class="end" command="command:logout">Exit</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script lang="ts">
import { Component, mixins, Prop, Provide, Emit, Watch } from 'nuxt-property-decorator'
import BaseMixin from '~/mixins/base'
import { NavMenu } from '@/types/client'

@Component<AuthPanel>({
  name: 'authpanel',
})
export default class AuthPanel extends mixins(BaseMixin) {

  @Prop({ default: undefined })
  options!: NavMenu.AuthPanel

  @Provide()
  visible: boolean = false

  @Provide()
  avatar: string = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

  handleVisible (visible: boolean) {
    this.visible = visible
  }

  @Emit('command')
  handleCommand (value: string) {}

  handleButton (evt: MouseEvent, command: string) {
    evt.stopPropagation()
    this.handleCommand(command)
  }
}
</script>