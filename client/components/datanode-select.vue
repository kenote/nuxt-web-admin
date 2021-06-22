<template>
  <fragment v-loading="loading">
    <div class="filler-tools">
      <el-input v-model="keywords" placeholder="检索内容；可以使用正则" style="width:200px" size="medium">
        <i slot="suffix" class="el-icon-error" @click="handleCleanKeywords" v-if="keywords"></i>
      </el-input>
    </div>
    <perfect-scrollbar :options="{ suppressScrollX: true }">
      <div class="filler-body">
        <el-tree ref="theTree"
          :data="propData"
          :props="props"
          @check-change="handleCheckChange" 
          :node-key="nodeKey" 
          :default-checked-keys="DefaultValues"
          :filter-node-method="filterNode"
          show-checkbox
          check-on-click-node
          default-expand-all>

        </el-tree>
      </div>
    </perfect-scrollbar>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch, Prop, Emit, mixins } from 'nuxt-property-decorator'
import { CommonDataNode, ChannelDataNode } from'@kenote/common'
import { Tree as ElTree } from 'element-ui'
import ruleJudgment from 'rule-judgment';
import { get, cloneDeep, compact } from 'lodash'
import { Channel } from '@/types/client'
import EnvironmentMixin from '~/mixins/environment'
import { parseParams } from '@/utils'

@Component<DatanodeSelect>({
  name: 'datanode-select',
  created () {
    this.DefaultValues = parseParams(this.defaultValues || '')(this.env)
    this.propData = this.data ?? []
    if (this.request) {
      this.getData(this.request, null, data => {
        this.propData = data ?? []
      })
    }
    this.values = this.DefaultValues
  }
})
export default class DatanodeSelect extends mixins(EnvironmentMixin) {

  @Prop({ default: false })
  loading!: boolean

  @Prop({ default: undefined })
  data!: CommonDataNode[]
  
  @Prop({ default: undefined })
  defaultValues!: string[]

  @Prop({ default: undefined })
  request!: Channel.RequestConfig

  @Prop({ default: undefined })
  props!: Record<string, any>

  @Prop({ default: '' })
  nodeKey!: string

  @Prop({ default: undefined })
  action!: Channel.RequestConfig

  @Prop({ default: 'node' })
  postKey!: string

  @Prop({ default: undefined })
  submitOptions!: Channel.SubmitOptions

  @Provide()
  DefaultValues: string[] = []

  @Provide()
  propData: CommonDataNode[] = []

  @Provide()
  keywords: string = ''
  
  @Provide()
  values: string[] = []

  @Emit('submit')
  submit (values: Record<string, any>, action: Channel.RequestConfig, options: Channel.SubmitOptions) {}

  @Emit('get-data')
  getData (request: Channel.RequestConfig, options: any, next: (data: CommonDataNode[]) => void) {}

  @Watch('keywords')
  onKeywordsChange (val: string, oldVal: string) {
    if (val === oldVal) return
    let theTree = this.$refs['theTree'] as ElTree
    theTree.filter(val)
  }

  /**
   * 选中/取消节点
   */
  handleCheckChange (data: ChannelDataNode<any>, checked: boolean, indeterminate: boolean) {
    let theTree = this.$refs['theTree'] as ElTree
    let values = compact(theTree.getCheckedKeys())
    if (values === this.values) return
    this.values = values
  }

  /**
   * 清除检索器
   */
  handleCleanKeywords () {
    this.keywords = ''
  }

  /**
   * 检索节点
   */
  filterNode (value: string, data: CommonDataNode) {
    return ruleJudgment({ name: { $regex: new RegExp(value) } })(data)
  }

  handleSubmit () {
    let values = {
      [this.postKey]: this.values
    }
    this.submit(values, this.action, this.submitOptions)
  }
  
}
</script>