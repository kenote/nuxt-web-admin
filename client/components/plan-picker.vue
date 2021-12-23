<template>
  <div style="display:inline;">
    <el-select v-model="selectedValue" :placeholder="placeholder" :size="size" @change="handleChangePlan" filterable>
      <el-option v-for="(item, key) in data" :key="key" :label="item.name" :value="item._id"></el-option> 
    </el-select>
    <el-dropdown
      :size="size"
      @click="handleSaveData"
      @command="handleCommand"
      split-button >
      <span>保存</span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="create" :disabled="!selectedValue">另存</el-dropdown-item>
        <el-dropdown-item command="remove" :disabled="!selectedValue">删除</el-dropdown-item>
        <el-dropdown-item command="clear" :disabled="!selectedValue">清除</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Emit, Watch, Model } from 'nuxt-property-decorator'
import { PlanDocument } from '@/types/services/db'
import { ElMessageBoxOptions, MessageBoxInputData } from 'element-ui/types/message-box'
import { Channel } from '@/types/client'
import { Store } from '~/store'
import jsYaml from 'js-yaml'
import { DeleteWriteResult, UpdateWriteResult } from '@kenote/mongoose'

@Component<Planpicker>({
  name: 'plan-picker',
  created () {
    this.data = this.drafts.filter( v => v.associate === this.associate )
    this.selectedValue = this.value
  }
})
export default class Planpicker extends Vue {

  @Store.Auth.State
  drafts!: PlanDocument[]

  @Prop({ default: undefined })
  associate!: string
  
  @Prop({ default: undefined }) 
  placeholder!: string

  @Prop({ default: undefined }) 
  size!: 'medium' | 'small' | 'mini'

  @Provide() 
  data: PlanDocument[] = []

  @Provide() 
  selectedValue: string = ''

  @Watch('drafts')
  onDraftsChange (val: PlanDocument[], oldVal: PlanDocument[]) {
    if (val === oldVal) return
    this.data = val.filter( v => v.associate === this.associate )
  }

  @Watch('value')
  onValue (val: string, oldVal: string) {
    if (val === oldVal) return
    if (val === this.selectedValue) return
    this.selectedValue = val
  }

  @Watch('selectedValue')
  onSelectedValue (val: string, oldVal: string) {
    if (val === oldVal) return
    if (val === this.value) return
    this.update(val)
  }

  @Model('update')
  value!: string

  @Emit('update')
  update (value: string) {}
  
  @Emit('change')
  change (value: any) {}

  /**
   * 切换草稿
   */
  handleChangePlan (value: string) {
    let item = this.data.find( v => v._id === value )
    if (item) {
      let values = jsYaml.load(item.content)
      this.$emit('change', values)
    }
  }

  handleCommand (command: string) {
    if (command === 'create') {
      this.handleCreateData()
    }
    else if (command === 'remove') {
      this.handleRemoveData()
    }
    else if (command === 'clear') {
      this.selectedValue = ''
      this.$emit('clear')
    }
  }

  /**
   * 保存草稿
   */
  handleSaveData () {
    if (this.selectedValue) {
      let requestConfig: Channel.RequestConfig = {
        method: 'POST',
        url: `/api/plan/edit/${this.selectedValue}`,
        params: {
          type: 'draft'
        }
      }
      this.$emit('update-data', requestConfig, (result: UpdateWriteResult) => {
        // 更新草稿
      })
    }
    else {
      this.handleCreateData()
    }
  }

  /**
   * 创建草稿
   */
  async handleCreateData () {
    try {
      let options: ElMessageBoxOptions = {
        confirmButtonText: '确定', 
        cancelButtonText: '取消',
        inputValue: '',
        inputPlaceholder: '设置草稿名称'
      }
      let result = await this.$prompt(``, `创建草稿`, options) as MessageBoxInputData
      let requestConfig: Channel.RequestConfig = {
        method: 'POST',
        url: '/api/plan/create',
        params: {
          type: 'draft',
          name: result.value,
          associate: this.associate
        }
      }
      this.$emit('create-data', requestConfig, (data: PlanDocument) => {
        this.selectedValue = data._id
      })
    } catch (error) {
      this.$message.warning(`您已取消编辑操作`)
    }
  }

  /**
   * 删除草稿
   */
  handleRemoveData () {
    let requestConfig: Channel.RequestConfig = {
      method: 'DELETE',
      url: `/api/plan/${this.selectedValue}`,
      params: {
        type: 'draft'
      }
    }
    this.$emit('remove-data', requestConfig, (result: DeleteWriteResult) => {
      // 删除草稿
      if (result.ok! > 0) {
        this.selectedValue = ''
      }
    })
  }
}
</script>