<template>
  <div style="margin-right:15px">

    <!-- 全选 -->
    <el-checkbox v-if="multiple" 
      style="margin-right:30px;width:auto;" 
      v-model="checkAll" 
      :indeterminate="isIndeterminateAll"
      @change="handleCheckAllChange" >
      全选
    </el-checkbox>
    <!-- 检索 -->
    <el-input size="small" v-model="searchall" style="width:240px;" placeholder="检索内容；可以使用正则" >
      <i slot="suffix" class="el-icon-error" @click="handleCleanSearchAll" v-if="searchall"></i>
    </el-input>
    <!-- 渠道组 -->
    <dashboard-plan-picker
      v-model="selectedPlan"
      placeholder="请选择渠道组" 
      size="small"
      style="margin-left:15px;width:150px"
      type="ditch"
      :is-update="values.length > 0"
      @get-data="handleGetPlans" 
      @create-data="handleCreatePlan"
      @update-data="handleUpdatePlan"
      @remove-data="handleRemovePlan"
      @change="handleChangePlan"
      @reset="handleResetPlan"
      />
    <!-- 渠道列表 -->
    <el-checkbox-group v-if="multiple" style="margin-top: 15px;"
      v-model="values"
      ref="ditchContainer"
      class="ditch-list-container" 
      v-bind:style="unfoldStyle" 
      @change="handleCheckChange" >
      <template v-for="ditch in data">
        <el-checkbox :label="ditch.label" :key="ditch._id" v-show="filterDitch(ditch.name)" :border="border">{{ ditch.name }}</el-checkbox>
      </template>
    </el-checkbox-group>
    <el-radio-group v-else style="margin-top: 15px;"
      v-model="values"
      ref="ditchContainer"
      class="ditch-list-container" 
      v-bind:style="unfoldStyle" 
      @change="handleCheckChange" >
      <template v-for="ditch in data">
        <el-radio :label="ditch.label" :key="ditch._id" v-show="filterDitch(ditch.name)" :border="border">{{ ditch.name }}</el-radio>
      </template>
    </el-radio-group>
    <div class="unfold-container" v-if="onUnfold">
      <el-button v-if="unfoldStyle" type="text" class="el-icon-caret-top" @click="handleUnfold"></el-button>
      <el-button v-else type="text" class="el-icon-caret-bottom" @click="handleUnfold"></el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch, Model } from 'nuxt-property-decorator'
import { ResponseDitchDocument } from '@/types/proxys/ditch'
import { oc } from 'ts-optchain'
import { DitchOptions } from '@/types'
import { ResponsePlanDocument, PlanType } from '@/types/proxys/plan'
import * as yaml from 'js-yaml'
import { UpdateWriteResult, DeleteWriteResult } from 'kenote-mongoose-helper'

@Component<DashboardDitchPicker>({
  name: 'dashboard-ditch-picker',
})
export default class DashboardDitchPicker extends Vue {
  
  @Prop({ default: false }) multiple!: boolean
  @Prop({ default: [] }) data!: ResponseDitchDocument[]
  @Prop({ default: false }) border!: boolean
  @Prop({ default: undefined }) options!: DitchOptions

  @Provide() searchall: string = ''
  @Provide() values: string[] = []
  @Provide() checkAll: boolean = false
  @Provide() isIndeterminateAll: boolean = false
  @Provide() onUnfold: boolean = false
  @Provide() unfoldStyle: string = ''
  @Provide() selectedPlan: string = ''

  @Model('update') readonly value!: string[]

  @Watch('data')
  onDataChange (val: ResponseDitchDocument[], oldVal: ResponseDitchDocument[]):void {
    setTimeout(() => {
      let ditchContainer = this.$refs['ditchContainer'] as Vue
      this.onUnfold = ditchContainer.$el.scrollHeight > ditchContainer.$el.clientHeight
    }, 0)
  }

  @Watch('value')
  onValueChange (val: string[], oldVal: string[]): void {
    if (val.length === 1 && val[0] === undefined) {
      this.values = []
      this.handleCheckChange(this.values)
    }
    else {
      this.values = val
    }
    let checkedCount = this.values.length
    this.checkAll = checkedCount === this.data.length
    this.isIndeterminateAll = checkedCount > 0 && checkedCount < this.data.length
  }

  @Watch('options.plan.pid')
  onOptionsChange (val: number, oldVal: number): void {
    this.selectedPlan = ''
  }

  handleUnfold () {
    if (this.unfoldStyle === '') {
      this.unfoldStyle = 'max-height:inherit'
    }
    else {
      this.unfoldStyle = ''
    }
  }

  handleGetPlans (type: PlanType, next: (doc: any) => void): void {
    let planGetData = oc(this.options).plan.get()
    if (planGetData) {
      planGetData(type, next)
    }
    else {
      this.$emit('get-plans', type, next)
    }
  }

  /**
   * 创建渠道组
   */
  handleCreatePlan (options: any, next: (doc: any) => void): void {
    let { type, name } = options
    let planCreateData = oc(this.options).plan.create()
    if (planCreateData) {
      planCreateData(type, name, this.values, next)
    }
    else {
      this.$emit('create-plan', type, name, this.values, next)
    }
  }

  /**
   * 更新渠道组
   */
  handleUpdatePlan (options: any, next: (doc: any) => void): void {
    let { _id, name, content } = options
    let planUpateData = oc(this.options).plan.update()
    let updateResult = (data: UpdateWriteResult): void => {
      if (data.ok === 1) {
        return next(yaml.dump(this.values))
      }
      else {
        this.$emit('update', yaml.load(content))
      }
    }
    if (planUpateData) {
      planUpateData(_id, name, this.values, updateResult)
    }
    else {
      this.$emit('update-plan', _id, name, this.values, updateResult)
    }
  }

  /**
   * 删除渠道组
   */
  handleRemovePlan (_id: string, next: () => void): void {
    let planRemoveData = oc(this.options).plan.remove()
    let deleteResult = (data: DeleteWriteResult) => {
      if (data.ok === 1) {
        this.$emit('update', [])
        return next()
      }
    }
    if (planRemoveData) {
      planRemoveData(_id, deleteResult)
    }
    else {
       this.$emit('remove-plan', _id, deleteResult)
    }
  }

  /**
   * 重置渠道组
   */
  handleResetPlan (): void {
    this.$emit('update', [])
  }

  /**
   * 切换渠道组
   */
  handleChangePlan (value: string, plans: ResponsePlanDocument[]): void {
    let plan = plans.find( o => o._id === value ) as ResponsePlanDocument
    let values: string[] = []
    if (plan) {
      values = yaml.load(plan.content)
      this.$emit('update', values)
    }
  }

  /**
   * 勾选渠道
   */
  handleCheckChange (values: string[]): void {
    this.$emit('update', values) 
    // this.selectedPlan = ''
  }

  /**
   * 全选/取消 渠道
   */
  handleCheckAllChange (value: any): void {
    let ditchs: ResponseDitchDocument[] = this.data
    let values: string[] = []
    if (value) {
      values = Array.from(new Set(this.values.concat(ditchs.map( o => o.label ))))
    }
    else {
      values = this.values.filter( v => ditchs.map( o => o.label ).indexOf(v) === -1 )
    }
    this.isIndeterminateAll = false
    this.$emit('update', values)
    // this.selectedPlan = ''
  }

  /**
   * 清除搜索条件
   */
  handleCleanSearchAll (): void {
    this.searchall = ''
  }

  /**
   * 按搜索条件过滤渠道
   */
  filterDitch (value: string): boolean {
    try {
      let reg = new RegExp(this.searchall)
      return reg.test(value)
    } catch (error) {
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
.ditch-list-container {
  position: relative;
  overflow-y: auto;
  max-height: 130px;
  transition: all .4s;

  &.el-radio-group {
    display: block;
    line-height: 40px;
    margin-top: 8px;
  }
}
.unfold-container {
  text-align: center;
}
.dashboard-page .search-container .el-checkbox.is-bordered {
  width: 170px;
}
.dashboard-page .search-container .el-radio.is-bordered {
  width: 170px;
}
.dashboard-page .search-container .el-checkbox {
  width: 130px;
}
.dashboard-page .search-container .el-radio {
  width: 130px;
}
</style>