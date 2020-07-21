<template>
  <div style="display:inline">
    <el-select v-model="selectedValue" :placeholder="placeholder" :size="size" @change="handleChangePlan" filterable>
      <el-option v-for="(item, key) in data" :key="key" :label="item.name" :value="item._id"></el-option> 
    </el-select>
    <el-dropdown :size="size" @command="handleCommand" split-button 
      @click="handleSaveData"
      :class="!isUpdate && !selectedValue ? 'el-dropdown-disabled' : ''" >
      <span>保存</span>
      <el-dropdown-menu slot="dropdown">
        <fragment v-if="isUpdate || selectedValue">
          <el-dropdown-item command="create" :disabled="!selectedValue">另存</el-dropdown-item>
          <el-dropdown-item command="remove" :disabled="!selectedValue">删除</el-dropdown-item>
          <el-dropdown-item command="reset" :disabled="!isUpdate && !selectedValue">清除</el-dropdown-item>
        </fragment>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch, Model } from 'nuxt-property-decorator'
import { ResponsePlanDocument } from '@/types/proxys/plan'
import { MessageBoxInputData } from 'element-ui/types/message-box'
import * as yaml from 'js-yaml'
import { remove } from 'lodash'

@Component<DashboardPlanPicker>({
  name: 'dashboard-plan-picker',
  created () {
    this.$emit('get-data', this.type, this.handleGetData)
  }
})
export default class DashboardPlanPicker extends Vue {

  @Prop({ default: undefined }) placeholder!: string
  @Prop({ default: undefined }) size!: 'medium' | 'small' | 'mini'
  @Prop({ default: '' }) type!: string
  @Prop({ default: false }) isUpdate!: boolean
  @Prop({ default: '标题' }) title!: string

  @Provide() data: ResponsePlanDocument[] = []
  @Provide() selectedValue: string = ''

  @Model('update') readonly value!: string

  @Watch('value')
  onValueChange (val: string, oldVal: string): void {
    this.selectedValue = val
    this.$emit('change', val, this.data)
  }

  handleChangePlan (value: string): void {
    this.$emit('update', value)
  }

  handleGetData (data: ResponsePlanDocument[]): void {
    this.data = data
  }

  async handleCommand (command: string): Promise<void> {
    if (!command) return
    switch (command) {
      case 'create':
        await this.handleCreateData()
        break
      case 'remove':
        this.handleRemoveData()
        break
      case 'reset':
        this.$emit('update', '')
        this.$emit('reset')
        break
      default: 
        break
    }
  }

  async handleSaveData (): Promise<void> {
    if (!this.isUpdate && !this.selectedValue) return
    if (this.selectedValue) {
      let plan = this.data.find( o => o._id === this.selectedValue ) as ResponsePlanDocument
      this.$emit('update-data', plan, (content: string): void => {
        plan.content = content
        this.$message.success('数据已经更新')
      })
    }
    else {
      await this.handleCreateData()
    }
  }

  async handleCreateData (): Promise<void> {
    try {
      let result = await this.$prompt(`请输入${this.title}名称`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', }) as MessageBoxInputData
      this.$emit('create-data', { type: this.type, name: result.value }, (data: ResponsePlanDocument): void => {
        this.data.push(data)
        this.$emit('update', data._id)
      })
    } catch (error) {
      this.$message({ type: 'info', message: '取消输入' })
    }
  }

  handleRemoveData (): void {
    if (!this.selectedValue) return
    this.$emit('remove-data', this.selectedValue, () => {
      remove(this.data, o => o._id === this.selectedValue)
      this.$emit('update', '')
    })
  }
  
}
</script>