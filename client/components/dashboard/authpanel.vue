<template>
  <el-dropdown trigger="click" @visible-change="handleVisible" @command="handleCommand">
    <a class="header-link" v-bind:class="visible ? 'active' : ''">
      <span class="el-dropdown-link">
        <el-avatar icon="el-icon-user-solid" size="large" :src="avatar"></el-avatar>
        {{ /* auth.username || '' */ }}
      </span>
    </a>
    <el-dropdown-menu slot="dropdown" class="header-link-dropdown">
      <div class="header-link-dropdown-head">
        <h3><span>{{ auth && auth.username || '' }}</span></h3>
        <el-row>
          <template v-for="(entrance, key) in userEntrance">
            <el-col :span="8"  v-if="key < 3" :key="key">
              <el-dropdown-item :command="entrance.command">{{ entrance.name }}</el-dropdown-item>
            </el-col>
          </template>
        </el-row>
      </div>
      <el-dropdown-item divided></el-dropdown-item>
      <template v-for="(entrance, key) in userEntrance">
        <el-dropdown-item v-if="key >= 3" :key="key" :command="entrance.command">{{ entrance.name }}</el-dropdown-item>
      </template>
      <el-dropdown-item divided style="text-align: center" command="command:logout">退出控制台</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Emit, Watch, mixins } from 'nuxt-property-decorator'
import { ResponseUserDocument } from '@/types/proxys/user'
import { DashboardOptions } from '@/types/restful'
import { getUrl } from '@/utils/format'
import ComponentMixin from '~/mixins/component'

@Component<DashboardAuthPanel>({
  name: 'dashboard-authpanel',
  created () {
    let { avatar } = this.auth
    if (avatar) {
      this.avatar = getUrl(avatar || this.defaultAvatar)
    }
  }
})
export default class DashboardAuthPanel extends mixins(ComponentMixin) {
  
  // @Prop({ default: null }) auth!: ResponseUserDocument
  @Prop({ default: [] }) userEntrance!: DashboardOptions.userEntrance
  // @Prop({ default: 0 }) timestamp!: number
  // @Prop({ default: '' }) defaultAvatar!: string

  @Provide() visible: boolean = false
  @Provide() avatar: string = ''

  getUrl = getUrl

  @Watch('timestamp')
  onTimestampChange( val: number, oldVal: number): void {
    let { avatar } = this.auth
    this.avatar = getUrl(avatar || this.defaultAvatar)
  }

  handleVisible (visible: boolean): void {
    this.visible = visible
  }

  @Emit('command')
  handleCommand (value: string): void {
    
  }
}
</script>

<style lang="scss" scoped>
.header-link {
  .el-avatar {
    margin-top: 8px;
    background: transparent;
  }
}
</style>