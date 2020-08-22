<template>
  <div>
    <h2>渠道分组 : {{ title }}</h2>
    <div class="form-container" v-if="mode === 'grouping'">
      <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="handleSubmit" label-width="150px">
        <el-form-item prop="key" :rules="rules.key" label="组标签">
          <el-input v-model="values.key" placeholder="请输入组标签" style="width:300px;" />
        </el-form-item>
        <el-form-item prop="name" :rules="rules.name" label="组名称">
          <el-input v-model="values.name" placeholder="请输入组名称" style="width:300px;" />
        </el-form-item>
        <el-form-item label="渠道分配">
          <el-transfer ref="theTransfer"
            filterable
            :filter-method="filterMethod"
            v-model="values.ditchs" 
            :titles="['可选渠道', '已选渠道']"
            :props="{ key: 'label', label: labelName }"
            :data="data"
            >
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
        :search-options="{ field: 'name' }"
        :data="groups"
        :flag="{}"
        :footer-open="false"
        @getdata="$emit('get-ditch-group', handleList)"
        @command="handleCommand"
        :loading="loading" >
      </dashboard-table>
    </template>
    <!-- 底部操作区 -->
    <dashboard-footer-bar :visible="true">
      <el-button type="primary" @click="mode = 'grouping'" :disabled="mode === 'grouping'">添加分组</el-button>
      <el-button type="success" @click="$emit('goback', null)">返回</el-button>
      
      <el-select v-model="labelName" placeholder="请选择" style="margin-left:20px" >
        <el-option v-for="(item, key) in labelOptions" :key="key" :label="item.name" :value="item.key"></el-option>
      </el-select>
    </dashboard-footer-bar>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { Form as ElForm, Transfer as ElTransfer } from 'element-ui'
import { DitchGrouping, ResponseDitchDocument } from '@/types/proxys/ditch'
import { KeyMap, Maps, Rule } from 'kenote-config-helper'
import { Channel } from '@/types/channel'
import * as yaml from 'js-yaml'
import { remove } from 'lodash'

@Component<DashboardDitchGrouping>({
  name: 'dashboard-ditch-grouping'
})
export default class DashboardDitchGrouping extends Vue {
  
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: '' }) title!: string
  @Prop({ default: [] }) data!: ResponseDitchDocument[]

  @Provide() groups: DitchGrouping[] = []
  @Provide() mode: 'list' | 'grouping' = 'list'
  @Provide() edited: string = ''
  @Provide() values: DitchGrouping = {
    key: '',
    name: '',
    ditchs: []
  }
  @Provide() rules: Maps<Rule[]> = {
    key: [
      { required: true, message: '请输入组标签' }
    ],
    name: [
      { required: true, message: '请输入组名称' }
    ]
  }
  @Provide() labelName: string = 'name'
  @Provide() labelOptions: KeyMap<string>[] = [
    { key: 'name', name: '按名称显示' },
    { key: 'label', name: '按标签显示' }
  ]
  @Provide() columns: Channel.columns[] = [
    {
      key: 'key',
      name: '组标签',
      fixed: 'left',
      width: 120,
      sortable: true
    },
    {
      key: 'name',
      name: '组名称',
      width: 180
    },
    {
      key: 'ditchs',
      name: '渠道',
      minwidth: 300,
      align: 'left'
    },
    {
      key: 'actions',
      name: '操作',
      fixed: 'right',
      align: 'right',
      width: 240,
      emit: [
        {
          key: 'edit',
          name: '编辑'
        },
        {
          key: 'delete',
          name: '移除',
          type: 'danger',
          options: {
            confirm: [ '此操作将从列表中移除该分组, 是否继续?', '提示' ]
          }
        }
      ] as Channel.columnEmit[]
    }
  ]

  @Watch('labelName')
  onLabelNameChange (val: string, oldVal: string): void {
    let theTransfer = this.$refs['theTransfer'] as ElTransfer
    if (theTransfer) {
      theTransfer.clearQuery('left')
      theTransfer.clearQuery('right')
    }
  }

  @Watch('mode')
  onModeChange (val: string, oldVal: string): void {
    if (val === 'list') {
      this.edited = ''
    }
  }

  handleList (groups: DitchGrouping[]): void {
    this.groups = groups
  }

  handleCommand (type: string, row: DitchGrouping): void {
    switch (type) {
      case 'edit':
        this.mode = 'grouping'
        this.edited = row.key
        this.values = row
        break
      case 'delete':
        let groups = this.groups
        remove(groups, o => o.key === row.key)
        this.$emit('update-ditch-group', yaml.dump(groups), true, this.handleBackSubmit)
        break
      default:
        break
    }
  }

  handleSubmit (): void {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate(valid => {
      if (valid) {
        if (this.edited) {
          let grouping = this.groups.find( o => o.key === this.edited )
          if (grouping) {
            grouping = this.values
          }
          this.$emit('update-ditch-group', yaml.dump(this.groups), false, this.handleBackSubmit)
        }
        else {
          this.$emit('set-ditch-group', this.values, this.handleBackSubmit)
        }
        
      }
      else {
        return false
      }
    })
  }

  handleBackSubmit (isget?: any): void {
    this.mode = 'list'
    this.values = { key: '', name: '', ditchs: [] }
    if (isget) {
      this.$emit('get-ditch-group', this.handleList)
    }
  }

  filterMethod (query: string, item: ResponseDitchDocument): boolean {
    return item[this.labelName].includes(query)
  }
  
}
</script>