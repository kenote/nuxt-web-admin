<template>
  <div style="display:inline-block">
    <el-button 
      @click="handleOpenSelect" 
      :style="{ ...styles, textOverflow: 'ellipsis', overflow: 'hidden' }" 
      :disabled="disabled">
      {{ name }}
    </el-button>

    <!-- Dialog -->
    <el-dialog 
      :title="`选择${title}`" 
      width="960px" 
      :fullscreen="fullscreen" 
      :visible="dialog.visible" 
      :append-to-body="true"
      @close="handleCloseSelect(false)">
      <div slot="title" class="el-dialog__header_left">
        <span class="el-dialog__title">选择{{ title }}</span>
        <el-button :icon="fullscreen ? 'el-icon-copy-document' : 'el-icon-full-screen'" style="float:right" @click="fullscreen = !fullscreen"></el-button>
      </div>
      <section :style="bodyStyles">
        <div class="filler-tools">
          <el-input v-model="keywords" placeholder="检索内容；可以使用正则" style="width:200px" size="medium">
            <i slot="suffix" class="el-icon-error" @click="handleCleanKeywords" v-if="keywords"></i>
          </el-input>
        </div>
        <perfect-scrollbar :options="{ suppressScrollX: true }">
          <div class="filler-body">
            <el-tree ref="theTree" v-if="dialog.visible"
              :data="data"
              :props="props"
              @check-change="handleCheckChange" 
              :node-key="nodeKey" 
              :default-checked-keys="dialog.value"
              :filter-node-method="filterNode"
              show-checkbox
              check-on-click-node
              default-expand-all>

            </el-tree>
          </div>
        </perfect-scrollbar>
            
      </section>
      <span slot="footer" class="dialog-footer">
        <div class="dialog-footer-left">
          
        </div>
        <el-button @click="handleCloseSelect(false)">取 消</el-button>
        <el-button type="primary" @click="handleCloseSelect(true)">确 定</el-button>
      </span>

    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Model, Emit, Watch, Provide, Inject, Prop, mixins } from 'nuxt-property-decorator'
import { get, cloneDeep, compact } from 'lodash'
import Emitter from 'element-ui/lib/mixins/emitter'
import { CommonDataNode, ChannelDataNode } from'@kenote/common'
import { Tree as ElTree } from 'element-ui'
import ruleJudgment from 'rule-judgment';

interface DialogOptions {
  visible   ?: boolean
  value     ?: any
}

@Component<DataNodePicker>({
  name: 'datanode-picker',
  mounted () {
    this.values = this.value
  }
})
export default class DataNodePicker extends mixins(Emitter) {

  @Inject({ default: '' })
  readonly elFormItem!: string

  @Prop({ default: undefined })
  data!: ChannelDataNode<any>[]

  @Prop({ default: false })
  disabled!: boolean

  @Prop({ default: '' })
  title!: string

  @Prop({ default: undefined })
  width!: number | 'auto'

  @Prop({ default: undefined })
  props!: Record<string, any>

  @Prop({ default: '' })
  nodeKey!: string
  
  @Provide()
  values: string[] = []

  @Provide()
  name: string = ''

  @Provide()
  initial: boolean = true

  @Provide()
  dialog: DialogOptions = {}

  @Provide()
  fullscreen: boolean = false

  @Provide()
  bodyStyles: Record<string, any> = { height: '500px' }

  @Provide()
  styles: Record<string, any> = {}

  @Provide()
  keywords: string = ''

  @Model('update')
  value!: string[]

  @Emit('update')
  update (value: string[]) {}
  
  @Emit('change')
  change (value: string[]) {}

  @Watch('value')
  onValueChange (val: string[], oldVal: string[]) {
    if (val === oldVal) return
    this.values = val
    if (!this.initial) {
      get(this, 'dispatch')('ElFormItem', 'el.form.change', val)
    }
    this.initial = false
  }

  @Watch('values')
  onValuesChange (val: string[], oldVal: string[]) {
    if (val === oldVal) return
    this.name = `点击选择${this.title}`
    this.update(val)
  }

  @Watch('width')
  onWidthChange (val: number | 'auto', oldVal: number | 'auto') {
    if (val === oldVal) return
    if (val) {
      this.styles = { width: val === 'auto' ? '100%' : `${val}px` }
    }
    else {
      this.styles = {}
    }
  }

  @Watch('fullscreen')
  onFullscreenChange (val: boolean, oldVal: boolean) {
     if (val === oldVal) return
     if (val) {
       this.bodyStyles = { height: 'calc(100vh - 185px)' }
     }
     else {
       this.bodyStyles = { height: '500px' }
     }
  }

  @Watch('keywords')
  onKeywordsChange (val: string, oldVal: string) {
     if (val === oldVal) return
     let theTree = this.$refs['theTree'] as ElTree
     theTree.filter(val)
  }
  
  /**
   * 打开选择器
   */
  handleOpenSelect () {
    this.dialog = { visible: true, value: cloneDeep(this.values) }
  }

  /**
   * 关闭选择器
   */
  handleCloseSelect (confirm: boolean = false) {
    if (confirm) {
      this.values = cloneDeep(this.dialog.value)
    }
    this.dialog = { visible: false, value: [] }
    this.handleCleanKeywords()
    this.fullscreen = false
  }

  /**
   * 选中/取消节点
   */
  handleCheckChange (data: ChannelDataNode<any>, checked: boolean, indeterminate: boolean) {
    let theTree = this.$refs['theTree'] as ElTree
    let values = compact(theTree.getCheckedKeys())
    if (values === this.dialog.value) return
    this.dialog.value = values
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
}
</script>