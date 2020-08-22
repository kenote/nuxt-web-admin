<template>
  <fragment>
    <div class="form-container">
      <h2>编辑{{ titlename[type] }} [{{ name }}] -- 访问权限</h2>
      <el-form ref="theForm" label-width="150px">
        <el-tabs v-model="activeName" tab-position="right">
          <template v-for="(channel, key) in orderBy(channels, ['id'], ['asc'])">
            <el-tab-pane :key="key" :label="channel.name" :name="channel.id.toString()" style="margin: 10px 30px;">
              <el-tree 
                :data="channel.navs" 
                :props="{ id: 'index', label: 'name' }" 
                :default-checked-keys="checkedKeys" 
                @check-change="handleCheckChange" 
                node-key="index" 
                show-checkbox
                default-expand-all />
            </el-tab-pane>
          </template>
        </el-tabs>
      </el-form>
    </div>
    <!-- 底部操作区 -->
    <dashboard-footer-bar v-if="showFooter" :visible="showFooter">
      <el-button type="primary" @click="handleSubmit" :loading="loading">提 交</el-button>
      <el-button type="success" @click="$emit('goback', null)">返回</el-button>
    </dashboard-footer-bar>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from 'nuxt-property-decorator'
import { Form as ElForm } from 'element-ui'
import { Channel } from '@/types/channel'
import { orderBy, remove, clone } from 'lodash'
import { Channel as IChannel, Maps } from 'kenote-config-helper'

@Component<DashboardAccess>({
  name: 'dashboard-access',
  created () {
    this.checkedKeys = this.data
  }
})
export default class DashboardAccess extends Vue {
  
  @Prop({ default: 'group' }) type!: 'group' | 'team' | 'user'
  @Prop({ default: '' }) name!: string
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: [] }) channels!: Channel.element[]
  @Prop({ default: [] }) data!: never[]

  @Provide() titlename = {
    group: '用户组',
    team: '团队',
    user: '用户'
  }
  @Provide() showFooter: boolean = true
  @Provide() activeName: string = '1'
  @Provide() checkedKeys: string[] = []

  orderBy = orderBy

  handleSubmit (): void {
    let checkedKeys = clone(this.checkedKeys)
    remove(checkedKeys, o => !/^(\/)/.test(o))
    this.$emit('submit', { access: checkedKeys })
  }

  handleCheckChange (data: any, checked: boolean, indeterminate: boolean): void {
    let checkedKeys = this.checkedKeys
    if (checked) {
      checkedKeys.push(data.index)
    }
    else {
      remove(checkedKeys, o => o === data.index)
    }
    this.checkedKeys = checkedKeys
  }

  // filterAccess (access: string): boolean {
  //   for (let channel of this.channels) {
  //     let store = new IChannel(channel)
  //     if (store) {
  //       return !!store.find(access)
  //     }
  //   }
  //   return true
  // }
}
</script>