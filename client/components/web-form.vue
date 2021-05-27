<template>
  <div class="form-container">
    <h2>{{ name }}</h2>
    <el-row :gutter="20">
      <el-col :span="display ? 12 : 24">
        <el-form ref="theForm" :model="values" :rules="Rules" @submit.native.prevent="handleSubmit" label-width="150px" v-loading="loading">
          <template v-if="columns">
            <template v-for="(item, key) in columns">
              <el-form-item v-if="isFilter(item.conditions)" 
                :key="key" 
                :prop="item.type === 'avatar-picker' ? undefined : item.key" 
                :label="item.name" 
                :rules="Rules && Rules[item.key]" 
                :style="item.type === 'color-picker' ? 'height:40px;' : ''">
                <web-form-item 
                  v-model="values[item.key]"
                  :type="item.type"
                  :data="item.data"
                  :props="item.props"
                  :placeholder="item.placeholder" 
                  :width="item.width"
                  :height="item.height"
                  :border="item.border"
                  :min="item.min"
                  :max="item.max"
                  :step="item.step"
                  :format="item.format"
                  :value-format="item.valueFormat"
                  :options="item.options"
                  :multiple="item.multiple"
                  :disabled="isDisabled(item.disabled)"
                  :request="item.request"
                  :avatar-options="options && options.avatar"
                  @get-data="getData"
                  @upload-file="uploadFile"
                  @change="isChange && $emit('change', parseValues(values))"
                  />
              </el-form-item>
            </template>
          </template>
          <el-form-item v-if="!isChange">
            <el-button v-if="times === 0" type="primary" native-type="submit" :loading="loading">{{ submitName }}</el-button>
            <el-button v-else type="info" :loading="loading" disabled>(等待 {{ times }} 秒后) {{ submitName }}</el-button>
            <el-button v-if="submitOptions && submitOptions.reset" plain @click="handleRest">{{ submitOptions.reset }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col v-if="display" :span="11" style="padding-top:40px;">
        <slot name="display"></slot>
      </el-col>
    </el-row>
    
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Emit } from 'nuxt-property-decorator'
import { Verify, Channel } from '@/types/client'
import { Form as ElForm } from 'element-ui'
import { zipObject, unset, isEqual, map, pick, isPlainObject, isString, assign, cloneDeep, merge, omit } from 'lodash'
import { formatData, ParseData } from 'parse-string'
import { parseRules, isYaml } from '@/utils'
import ruleJudgment from 'rule-judgment'
import { FilterQuery } from '@kenote/common'
import nunjucks from 'nunjucks'
import jsYaml from 'js-yaml'

@Component<WebForm>({
  name: 'web-form',
  created () {
    this.values = cloneDeep(this.defaultValues ?? {})
    this.Rules = parseRules(this.rules, this)
    this.DefaultValues = this.defaultValues
  }
})
export default class WebForm extends Vue {

  @Prop({ default: '' })
  name!: string

  @Prop({ default: false })
  loading!: boolean

  @Prop({ default: undefined })
  columns!: Channel.FormItem[]

  @Prop({ default: undefined })
  rules!: Record<string, Array<Verify.Rule>>

  @Prop({ default: undefined })
  defaultValues!: Record<string, any>

  @Prop({ default: false })
  isChange!: boolean

  @Prop({ default: undefined })
  display!: boolean

  @Prop({ default: '提 交' })
  submitName!: string

  @Prop({ default: undefined })
  options!: Record<string, any>

  @Prop({ default: undefined })
  exclude!: string[]

  @Prop({ default: undefined })
  action!: Channel.RequestConfig

  @Prop({ default: undefined })
  submitOptions!: Channel.SubmitOptions

  @Prop({ default: undefined })
  valueFormat!: Record<string, ParseData.format | ParseData.format[]>

  @Prop({ default: undefined })
  unique!: (name: string, path: string | null, type: string) => Promise<any>

  @Prop({ default: 0 })
  times!: number

  @Prop({ default: undefined })
  env!: Record<string, any>

  @Provide()
  values: Record<string, any> = {}

  @Provide()
  Rules: Record<string, Array<Verify.Rule>> = {}

  @Provide()
  DefaultValues: Record<string, any> = {}

  @Emit('submit')
  submit (values: Record<string, any>, action: Channel.RequestConfig, options: Channel.SubmitOptions) {}

  @Emit('get-data')
  getData (options: Channel.RequestConfig, next: (data: { key: number | string, name: string }[]) => void) {}

  @Emit('upload-file')
  uploadFile (file: File, options: any, next: (doc: any, err?: Error) => void) {}

  @Emit('change')
  change (values: Record<string, any>) {}

  handleSubmit () {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate(valid => {
      if (valid) {
        let keys = map(this.columns.filter( r => this.isFilter(r.conditions!) ), 'key')
        let values = this.parseValues(pick(this.values, keys))
        let original = this.parseValues(pick(this.DefaultValues, keys))
        let { changeSubmit } = this.submitOptions
        if (changeSubmit && isEqual(values, original)) {
          this.$message.warning(changeSubmit ?? '数据好像没什么改变，无需提交')
          return
        }
        let submitOptions: Channel.SubmitOptions = merge(this.submitOptions, {
          next: val => {
            this.DefaultValues = assign(this.DefaultValues, val)
            this.values = cloneDeep(this.DefaultValues)
          }
        })
        this.submit(values, this.action, submitOptions)
      }
      else {
        return false
      }
    })
  }

  parseValues (value: Record<string, any>) {
    let values = this.exclude ? omit(value, this.exclude) : value
    let items = this.columns.filter( r => ['datetimerange', 'daterange', 'monthrange'].includes(r.type!) )
    for (let item of items) {
      let itemArr = item.key.split(/\_/)
      if (itemArr.length === 2) {
        values = { ...values, ...zipObject(itemArr, values[item.key]) }
        unset(values, item.key)
      }
    }
    for (let [key, val] of Object.entries(this.valueFormat ?? {})) {
      values[key] = formatData(val)(values[key] ?? '')
    }
    return values
  }

  handleRest () {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.resetFields()
    this.values = cloneDeep(this.DefaultValues)
  }

  isFilter (conditions: FilterQuery<any> | string) {
    if (!conditions) return true
    let query = conditions
    if (isString(conditions) && isYaml(conditions)) {
      query = jsYaml.safeLoad(nunjucks.renderString(conditions, this.env)) as FilterQuery<any>
      if (!isPlainObject(query)) return true
    } 
    let filter = ruleJudgment(query as FilterQuery<any>)
    return filter({ ...this.env, values: this.values })
  }

  isDisabled (disabled: boolean | FilterQuery<any> | string) {
    if (!disabled) return false
    let query = disabled
    if (isString(disabled) && isYaml(disabled)) {
      query = jsYaml.safeLoad(nunjucks.renderString(disabled, { ...this.env, values: this.values })) as FilterQuery<any>
      if (!isPlainObject(query)) return false
    } 
    if (isPlainObject(query)) {
      let filter = ruleJudgment(query as FilterQuery<any>)
      return filter({ ...this.env, values: this.values })
    }
    return disabled
  }
  
}
</script>