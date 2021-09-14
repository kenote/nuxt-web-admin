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
          <el-checkbox v-if="multiple"
            :indeterminate="isIndeterminate" 
            v-model="checkAll" 
            @change="handleCheckAllChange" 
            style="margin-right:30px">
            全选
          </el-checkbox>
          <el-input v-model="keywords" placeholder="检索内容；可以使用正则" style="width:200px" size="medium">
            <i slot="suffix" class="el-icon-error" @click="handleCleanKeywords" v-if="keywords"></i>
          </el-input>
        </div>
        <perfect-scrollbar :options="{ suppressScrollX: true }">
          <div class="filler-body">
            <el-row :gutter="20">
              <el-col v-for="(item, key) in data.map(parseProps(props))" 
                :key="key" 
                v-show="filterItem(toFormatString(item, format || '{label}'))" 
                :span="toSpan('md', 4)" 
                :md="{ span: toSpan('md', 4) }" 
                :lg="{ span: toSpan('lg', 3) }" 
                :xl="{ span: toSpan('xl', 3) }">
                <div class="tag" 
                  @click="handleClickItem(item)" 
                  v-bind:class="toStatusClass(item)">
                  {{ toFormatString(item, format || '{label}') }}
                </div>
              </el-col>
            </el-row>
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
import { Component, Vue, Prop, Provide, Model, Emit, Watch, mixins, Inject } from 'nuxt-property-decorator'
import { Channel } from '@/types/client'
import ruleJudgment from 'rule-judgment'
import { map, remove, cloneDeep, template, get } from 'lodash'
import { parseProps } from '@/utils'
import Emitter from 'element-ui/lib/mixins/emitter'

interface DialogOptions {
  visible   ?: boolean
  value     ?: any
}

@Component<WebSelect>({
  name: 'group-picker',
  created () {
    this.values = (this.multiple && !this.value) ? [] : this.value
    if (this.width) {
      this.styles = { width: this.width === 'auto' ? '100%' : `${this.width}px` }
    }
    else {
      this.styles = {}
    }
  }
})
export default class WebSelect extends mixins(Emitter) {

  @Inject({ default: '' })
  readonly elFormItem!: string

  @Prop({ default: undefined })
  data!: Channel.FormItemData[]

  @Prop({ default: false })
  disabled!: boolean

  @Prop({ default: '' })
  title!: string

  @Prop({ default: false })
  multiple!: boolean

  @Prop({ default: undefined })
  props!: Record<string, any>

  @Prop({ default: undefined })
  format!: string

  @Prop({ default: undefined })
  span!: Record<string, any>

  @Prop({ default: undefined })
  width!: number | 'auto'
  
  @Provide()
  values: any = ''

  @Provide()
  name: string = ''

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

  @Provide()
  checkAll: boolean = false

  @Provide()
  isIndeterminate: boolean = true

  @Provide()
  initial: boolean = true

  @Model('update')
  value!: string | string[]

  @Emit('update')
  update (value: string | string[]) {}
  
  @Emit('change')
  change (value: any) {}

  @Watch('value')
  onValueChange (val: string | string[], oldVal: string | string[]) {
    if (val === oldVal) return
    this.values = val
    if (!this.initial) {
      get(this, 'dispatch')('ElFormItem', 'el.form.change', val)
    }
    this.initial = false
  }

  @Watch('values')
  onCodeChange (val: string | string[], oldVal: string | string[]) {
    if (val === oldVal) return
    let _data = this.data.map(parseProps(this.props))
    if (this.multiple) {
      let list = _data.filter( ruleJudgment({ key: { $in: val } }) )
      let labels = map(list, 'label')
      this.name = list.length > 0 ? labels.join(', ') : `点击选择${this.title}`
      let checkedCount = val.length
      this.checkAll = checkedCount === this.data.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.data.length
    }
    else {
      let item = _data.find( ruleJudgment({ key: val }) )
      this.name = item?.label ?? `点击选择${this.title}`
    }
    this.update(val)
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

  parseProps = parseProps

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
    this.dialog = { visible: false, value: this.multiple ? [] : '' }
    this.handleCleanKeywords()
    this.fullscreen = false
  }

  /**
   * 判断单元是否选中
   */
  isActive (value: string) {
    if (!this.dialog.value) return
    if (this.multiple) {
      return this.dialog.value.includes(value)
    }
    else {
      return value === this.dialog.value
    }
  }

  toStatusClass(item: Record<string, any>) {
    let { key, disabled } = item
    let arr: string[] = []
    if (disabled) {
      arr.push('disabled')
    }
    if (this.isActive(key)) {
      arr.push('active')
    }
    return arr.join(' ')
  }

  /**
   * 选中/取消单元事件
   */
  handleClickItem (item: Record<string, any>) {
    let { key, disabled } = item
    if (disabled) return
    if (this.multiple) {
      if (this.isActive(key)) {
        let values = cloneDeep(this.dialog.value)
        remove(values, v => v === key )
        this.dialog.value = values
      }
      else {
        this.dialog.value.push(key)
      }
      let checkedCount = this.dialog.value.length
      this.checkAll = checkedCount === this.data.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.data.length
    }
    else {
      if (this.isActive(key)) return
      this.dialog.value = key
    }
  }

  /**
   * 检索/过滤单元
   */
  filterItem (value: string) {
    try {
      let reg = new RegExp(this.keywords)
      return reg.test(value)
    } catch (error) {
      return true
    }
  }

  /**
   * 清除检索器
   */
  handleCleanKeywords () {
    this.keywords = ''
  }

  /**
   * 全选操作
   */
  handleCheckAllChange (val: boolean) {
    let data = this.data.map(parseProps(this.props))
    if (val) {
      let filter = ruleJudgment({
        $or: [
          { disabled: { $not: { $eq: true } } },
          { key: { $in: this.dialog.value } }
        ]
      })
      this.dialog.value = map(data.filter( filter ), 'key')
    }
    else {
      let filter = ruleJudgment({
        disabled: true,
        key: { $in: this.dialog.value }
      })
      this.dialog.value = map(data.filter( filter ), 'key')
    }
    this.isIndeterminate = false
  }

  /**
   * 格式化显示
   */
  toFormatString (data: Record<string, any>, format: string = '{label}') {
    return template(format, { interpolate: /{([\s\S]+?)}/g })(data)
  }

  /**
   * 栅格占据的列数  md(default) | lg(>=1200) | xl(>=1920)
   */
  toSpan (tag: string, val: number) {
    if (!this.fullscreen) {
      return get(this.span, 'md') ?? 4
    } 
    return get(this.span, tag) ?? val
  }
}
</script>