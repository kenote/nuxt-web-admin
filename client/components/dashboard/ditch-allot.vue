<template>
  <div>
    <div class="form-container">
      <h2>渠道分配 : {{ title }}</h2>
      <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="handleSubmit" label-width="150px">
        <el-form-item prop="team" :rules="rules.team" label="选择团队">
          <el-select v-model="values.team" placeholder="请选择团队" filterable collapse-tags  style="width:300px;" @change="handleChangeTeam">
            <el-option v-for="team in teams" :key="team._id" :label="team.name" :value="team._id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="渠道分配">
          <el-transfer 
            filterable
            :filter-method="filterMethod"
            v-model="values.ditchs" 
            :titles="['可选渠道', '已选渠道']"
            :props="{ key: '_id', label: 'name' }"
            :data="data"
            >
          </el-transfer>
        </el-form-item>
      </el-form>
    </div>
    <!-- 底部操作区 -->
    <dashboard-footer-bar v-if="showFooter" :visible="showFooter">
      <el-button type="primary" style="margin-left:15px" @click="handleSubmit" :loading="loading" :disabled="!values.team">提交</el-button>
      <el-button type="success" style="margin-left:15px" @click="$emit('goback', null)">返回</el-button>
    </dashboard-footer-bar>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from 'nuxt-property-decorator'
import { ResponseDitchDocument } from '@/types/proxys/ditch'
import { ResponseTeamDocument } from '@/types/proxys/team'
import { Maps, Rule } from 'kenote-config-helper'
import { Document } from 'mongoose'
import { Form as ElForm } from 'element-ui'
import Ucenter from '@/types/apis/ucenter'

@Component<DashboardDitchAllot>({
  name: 'dashboard-ditch-allot',
  created () {
    this.showFooter = true
    this.$emit('get-teams', this.handleBackTeams)
  }
})
export default class DashboardDitchAllot extends Vue {
  
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: '' }) title!: string
  @Prop({ default: [] }) data!: ResponseDitchDocument[]

  @Provide() showFooter: boolean = false
  @Provide() teams: ResponseTeamDocument[] = []
  @Provide() values: Ucenter.ditchAllot = {
    team: undefined,
    ditchs: [],
    raw_ditchs: []
  }
  @Provide() rules: Maps<Rule[]> = {
    team: [
      { required: true, message: '请选择团队' }
    ]
  }

  handleSubmit (): void {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate(valid => {
      if (valid) {
        let { raw_ditchs, ditchs } = this.values
        let values: Ucenter.ditchAllot = {
          ...this.values,
          raw_ditchs: raw_ditchs.filter( o => !ditchs.includes(o) ) as string[]
        }
        this.$emit('submit', values)
      }
      else {
        return false
      }
    })
  }

  handleBackTeams (teams: ResponseTeamDocument[]): void {
    this.teams = teams
  }

  handleChangeTeam (value: string): void {
    let ditchs = this.data.filter( o => o.teams.map(parseById).includes(value) ).map(parseById)
    this.values.ditchs = ditchs
    this.values.raw_ditchs = ditchs
  }

  filterMethod (query: string, item: ResponseDitchDocument): boolean {
    return item.name.includes(query)
  }
  
}

function parseById (doc: Document): string {
  return String(doc._id)
}
</script>