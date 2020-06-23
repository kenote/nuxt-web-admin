<template>
  <div class="form-container">
    <h2>编辑{{ titlename[type] }} [{{ name }}] -- 频道入口</h2>
    <el-form ref="theForm" :model="values" @submit.native.prevent="handleSubmit" label-width="150px">
      <el-form-item>
        <el-transfer filterable :filter-method="filterMethod" v-model="values.platform" :titles="['可选频道', '已选频道']" :data="platforms" />
      </el-form-item>
      <el-form-item >
        <el-button type="primary" native-type="submit" :loading="loading">提 交</el-button>
        <el-button type="success" @click="$emit('goback', null)">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from 'nuxt-property-decorator'
import { Form as ElForm } from 'element-ui'
import { Channel } from '@/types/channel'
import { Option } from '@/types'
import { Maps } from 'kenote-config-helper'
import { orderBy, map } from 'lodash'

@Component<DashboardPlatform>({
  name: 'dashboard-platform',
  created () {
    this.platforms = orderBy(this.channels, ['id'], ['asc']).map(toTlatform)
    this.values.platform = this.data.filter(this.filterPlatform)
  }
})
export default class DashboardPlatform extends Vue {
  
  @Prop({ default: 'group' }) type!: 'group' | 'team'
  @Prop({ default: '' }) name!: string
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: [] }) channels!: Channel.element[]
  @Prop({ default: [] }) data!: never[]

  @Provide() titlename = {
    group: '用户组',
    team: '团队'
  }
  @Provide() platforms: Option[] = []
  @Provide() values = {
    platform: []
  }

  handleSubmit (): void {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate(valid => {
      if (valid) {
        this.$emit('submit', this.values)
      }
      else {
        return false
      }
    })
  }

  filterMethod (query: string, item: Option): boolean {
    return item.label.includes(query)
  }

  filterPlatform (platform: number): boolean {
    let channels = map(this.channels, 'id')
    return channels.includes(platform)
  }
}

function toTlatform (channel: Channel.element): Option {
  let { id, name } = channel
  return { key: id, label: name }
}
</script>