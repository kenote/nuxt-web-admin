<template>
  <div>
    <h2>团队《{{ name }}》 -- 成员管理</h2>
    <div class="form-container" v-if="mode === 'invitations'">
      <el-form ref="theForm" :model="values" @submit.native.prevent="handleSubmit" label-width="150px">
        <el-form-item label="搜索用户">
          <el-input v-model="keywords" placeholder="用户名/电子邮箱/手机号/昵称" style="width:300px;"  @keyup.native="$emit('search', keywords, handleFilterPeoples)" />
        </el-form-item>
        <el-form-item prop="peoples" label="选择用户">
          <el-transfer 
            filterable
            :filter-method="filterMethod"
            v-model="values.peoples" 
            :titles="['可选用户', '已选用户']"
            :data="users">
          </el-transfer>
        </el-form-item>
        <el-form-item >
          <el-button type="primary" native-type="submit" :loading="loading">提 交</el-button>
          <el-button type="success" @click="mode = 'list'">返回</el-button>
        </el-form-item>
      </el-form>
    </div>
    <template v-else>
      <dashboard-table
        :columns="columns"
        :search-options="{ field: 'username' }"
        :data="list"
        :auth-level="authLevel"
        :flag="flag"
        :footer-open="false"
        @getdata="$emit('getlist', handleList)"
        @command="handleCommand"
        :loading="loading" >
      </dashboard-table>
    </template>
    <!-- 底部操作区 -->
    <dashboard-footer-bar :visible="true">
      <el-button type="primary" @click="mode = 'invitations'" :disabled="authLevel < oc(flag).edit(0) || mode === 'invitations'">邀请成员</el-button>
      <el-button type="success" @click="$emit('goback', null)">返回</el-button>
    </dashboard-footer-bar>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { Form as ElForm } from 'element-ui'
import { PageFlag } from '@/types/restful'
import { Channel } from '@/types/channel'
import { ResponseUserDocument } from '@/types/proxys/user'
import { oc } from 'ts-optchain'
import { Option } from '@/types'
import { map, isEqual } from 'lodash'

@Component<DashboardPeople>({
  name: 'dashboard-people',
  created () {
    
  }
})
export default class DashboardPeople extends Vue {

  @Prop({ default: '' }) name!: string
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: 0 }) authLevel!: number
  @Prop({ default: {} }) flag!: PageFlag.item

  @Provide() mode: 'list' | 'invitations' = 'list'
  @Provide() showFooter: boolean = true
  @Provide() columns: Channel.columns[] = [
    {
      key: 'id',
      name: 'ID',
      fixed: 'left',
      width: 80,
      sortable: true
    },
    {
      key: 'username',
      name: '用户名',
      width: 180
    },
    {
      key: 'nickname',
      name: '昵称',
      width: 120
    },
    {
      key: 'sex',
      name: '性别',
      width: 80
    },
    {
      key: 'group.name',
      name: '角色',
      width: 120
    },
    {
      key: 'email',
      name: '电子邮箱',
      width: 240
    },
    {
      key: 'actions',
      name: '操作',
      fixed: 'right',
      align: 'right',
      width: 240,
      emit: [
        {
          key: 'delete',
          name: '移除',
          type: 'danger',
          options: {
            confirm: [ '此操作将从团队中移除该用户, 是否继续?', '提示' ]
          }
        }
      ] as Channel.columnEmit[]
    }
  ]
  @Provide() list: ResponseUserDocument[] = []
  @Provide() values = {
    peoples: []
  }
  @Provide() keywords: string = ''
  @Provide() users: Option[] = []

  @Watch('mode')
  onModeChange (val: string, oldVal: string): void {
    if (val === 'invitations') {
      this.users = this.list.map(this.toOption)
      this.keywords = ''
      this.values.peoples = map(this.list, '_id') as never[]
    }
  }
  

  oc = oc
  map = map
  isEqual = isEqual

  handleList (peoples: ResponseUserDocument[]): void {
    this.list = peoples
  }

  handleCommand (type: string, row: ResponseUserDocument) {
    if (type === 'delete') {
      this.$emit('remove', { peoples: [ row._id ] }, this.handleBackSubmit)
    }
  }

  handleFilterPeoples (users: ResponseUserDocument[]): void {
    let userOption = users.map(this.toOption)
    this.users = [
      ...this.users,
      ...userOption.filter(this.filterUserOption)
    ]
  }

  toOption (user: ResponseUserDocument): Option {
    return {
      key: user._id,
      label: user.username
    }
  }

  filterUserOption (option: Option): boolean {
    let result = this.users.map( o => o.key )
    return !result.includes(option.key)
  }

  handleSubmit (): void {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate(valid => {
      if (valid) {
        this.$emit('submit', this.values, this.handleBackSubmit)
      }
      else {
        return false
      }
    })
  }

  handleBackSubmit (data: any): void {
    this.mode = 'list'
    this.$emit('getlist', this.handleList)
  }

  filterMethod (query: string, item: Option): boolean {
    return item.label.includes(query)
  }
  
}
</script>