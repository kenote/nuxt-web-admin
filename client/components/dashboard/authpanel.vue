<template>
  <el-dropdown trigger="click" @visible-change="handleVisible" @command="handleCommand">
    <a class="header-link" v-bind:class="visible ? 'active' : ''">
      <span class="el-dropdown-link">
        {{ auth.username || '' }}
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
import { Component, Vue, Prop, Provide, Emit } from 'nuxt-property-decorator'
import { ResponseUserDocument } from '@/types/proxys/user'
import { DashboardOptions } from '@/types/restful'

@Component<DashboardAuthPanel>({
  name: 'dashboard-authpanel'
})
export default class DashboardAuthPanel extends Vue {
  
  @Prop({ default: null }) auth!: ResponseUserDocument
  @Prop({ default: [] }) userEntrance!: DashboardOptions.userEntrance

  @Provide() visible: boolean = false

  handleVisible (visible: boolean): void {
    this.visible = visible
  }

  @Emit('command')
  handleCommand (value: string): void {
    
  }
}
</script>