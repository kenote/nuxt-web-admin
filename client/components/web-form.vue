<template>
  <div :class="inline ? 'search-container' : 'form-container'">
    <h2>{{ name }}</h2>
    <el-form ref="theForm" 
      :model="values" 
      :rules="Rules" 
      @submit.native.prevent="handleSubmit" 
      :label-width="inline ? '100px' : '150px'" 
      v-loading="loading" 
      :inline="inline">
      <el-row :gutter="20">
        <el-col :span="display ? 12 : 24">
            <template v-if="columns">
              <template v-for="(item, key) in columns">
                <el-form-item v-if="isFilter(item.conditions, { values })" 
                  :key="key" 
                  :ref="item.key"
                  :prop="item.type === 'avatar-picker' ? undefined : item.key" 
                  :label="item.name" 
                  :label-width="item.labelWidth"
                  :rules="Rules && Rules[item.key]" 
                  :style="item.type === 'color-picker' ? 'height:40px;' : ''">
                  <el-select slot="label" v-if="item.label" v-model="values[item.label.key]">
                    <el-option v-for="(name, key) in item.label.options" :key="key" :label="name" :value="key"></el-option>
                  </el-select>
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
                    :size="item.size"
                    :format="item.format"
                    :value-format="item.valueFormat"
                    :options="item.options"
                    :multiple="item.multiple"
                    :disabled="isDisabled(item.disabled, { values })"
                    :request="item.request"
                    :avatar-options="options && options.avatar"
                    :code-times="codeTimes"
                    :is-send-code="isSend"
                    @send-code="sendCode(values)"
                    @get-data="getData"
                    @upload-file="uploadFile"
                    @change="isChange && $emit('change', parseValues(values))"
                    />
                  <span v-if="item.suffix">{{ item.suffix }}</span>
                </el-form-item>
              </template>
            </template>
        </el-col>
        
        <el-col v-if="display" :span="11" style="padding-top:40px;">
          <slot name="display"></slot>
        </el-col>
      </el-row>
      <el-row v-if="!isChange" :gutter="20">
        <el-col :span="24" >
          <div class="footer el-form-item">
            
            <el-button v-if="times === 0" type="primary" native-type="submit" :loading="loading">{{ submitName }}</el-button>
            <el-button v-else type="info" :loading="loading" disabled>(等待 {{ times }} 秒后) {{ submitName }}</el-button>
            <el-button v-if="submitOptions && submitOptions.reset" plain @click="handleRest">{{ submitOptions.reset }}</el-button>
            <el-button v-if="submitOptions && submitOptions.goback" plain @click="command('action:goback')">{{ submitOptions.goback }}</el-button>
            <template v-for="item in (submitOptions && submitOptions.emit) || []">
              <!-- <div :key="item.key">{{ item.name }}</div> -->
              
              <template v-if="isFilter(item.conditions, env)">
                <el-button v-if="item.type === 'button'" 
                  :key="item.key"
                  :type="item.style"
                  :disabled="isDisabled(item.disabled, { values })"
                  @click="command(item.command, {})" plain>
                  {{ parseTemplate(item.name, env) }}
                </el-button>
              </template>
            </template>
            <!-- 草稿 -->
            <plan-picker v-if="submitOptions && submitOptions.draft"
              v-model="selectedDraft"
              style="margin-left:10px"
              :associate="submitOptions.draft.associate"
              :placeholder="submitOptions.draft.placeholder"
              :size="submitOptions.draft.size"
              @create-data="handleUpdateDraft"
              @update-data="handleUpdateDraft"
              @remove-data="handleUpdateDraft"
              @clear="handleRest"
              @change="handleSetValues"
              />
            
          </div>
        </el-col>
      </el-row>
    </el-form>
    
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Emit, mixins } from 'nuxt-property-decorator'
import { Verify, Channel } from '@/types/client'
import { Form as ElForm, FormItem as ElFormItem } from 'element-ui'
import { zipObject, unset, isEqual, map, pick, assign, cloneDeep, merge, omit, isArray, get, set, identity, isUndefined, omitBy } from 'lodash'
import { formatData, ParseData } from 'parse-string'
import { parseRules, parseParams, parseTemplate } from '@/utils'
import EnvironmentMixin from '~/mixins/environment'
import ruleJudgment from 'rule-judgment'
import jsYaml from 'js-yaml'

@Component<WebForm>({
  name: 'web-form',
  created () {
    if (this.submitOptions?.assignment) {
      this.DefaultValues = get(this.env, 'conditions') ?? parseParams(this.defaultValues || '')(this.env)
    }
    else {
      this.DefaultValues = parseParams(this.defaultValues || '')(this.env)
    }
    this.values = cloneDeep(this.DefaultValues)
    this.Rules = parseRules(this.rules, this)
  },
  mounted () {
    let { associate } = this.verifyCodeOptions ?? {}
    if (associate) {
      this.isSend = false
      this.$watch(`values.${associate}`, (val, oldVal) => {
        if (val === oldVal) return
        let el = this.$refs[associate!] as ElFormItem | ElFormItem[]
        el = isArray(el) ? el[0] : el
        this.isSend = el?.$el?.className?.includes('is-validating')
      })
    }
  }
})
export default class WebForm extends mixins(EnvironmentMixin) {

  @Prop({ default: '' })
  name!: string

  @Prop({ default: false })
  inline!: boolean

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

  @Prop({ default: false })
  display!: boolean

  @Prop({ default: '提 交' })
  submitName!: string

  @Prop({ default: undefined })
  options!: Record<string, any>

  @Prop({ default: undefined })
  exclude!: string[]

  @Prop({ default: undefined })
  merge!: Record<string, string[]>

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

  @Prop({ default: 0 })
  codeTimes!: number

  @Prop({ default: undefined })
  verifyCodeOptions!: Channel.verifyCodeOptions

  @Provide()
  values: Record<string, any> = {}

  @Provide()
  Rules: Record<string, Array<Verify.Rule>> = {}

  @Provide()
  DefaultValues: Record<string, any> = {}

  @Provide()
  isSendCode: boolean = false

  @Provide()
  isSend: boolean = true

  @Provide()
  selectedDraft: string = ''

  @Emit('submit')
  submit (values: Record<string, any>, action: Channel.RequestConfig, options: Channel.SubmitOptions) {}

  @Emit('get-data')
  getData (request: Channel.RequestConfig, options: any, next: (data: { key: number | string, name: string }[]) => void) {}

  @Emit('upload-file')
  uploadFile (file: File, options: any, next: (doc: any, err?: Error) => void) {}

  @Emit('send-code')
  sendCode (data: any) {}

  @Emit('change')
  change (values: Record<string, any>) {}

  @Emit('command')
  command (type: string, row: Record<string, any>) {}

  @Emit('reset')
  reset (values: Record<string, any>) {}

  parseTemplate = parseTemplate

  handleUpdateDraft (options: Channel.RequestConfig, next: (data: any) => void) {
    options.params = merge(options.params, { content: jsYaml.dump(this.values) })
    this.getData(options, null, next)
  }

  handleSetValues (values: any) {
    this.values = values
  }

  handleSubmit () {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate(valid => {
      if (valid) {
        let keys = map(this.columns.filter( r => this.isFilter(r.conditions!) ), 'key')
        let values = this.parseValues(pick(this.values, keys))
        let original = this.parseValues(pick(this.DefaultValues, keys))
        let { changeSubmit } = this.submitOptions ?? {}
        if (changeSubmit && isEqual(omitBy(values, isUndefined), original)) {
          this.$message.warning(changeSubmit ?? '数据好像没什么改变，无需提交')
          return
        }
        let submitOptions: Channel.SubmitOptions = merge(this.submitOptions, {
          next: val => {
            this.DefaultValues = assign(this.DefaultValues, val)
            this.values = cloneDeep(this.DefaultValues)
          }
        })
        let labelFiller = ruleJudgment<Channel.FormItem>({ label: { $exists: true }})
        let labelKeys = map(this.columns.filter( labelFiller ), 'label.key')
        values = merge(values, pick(this.values, labelKeys))
        this.submit(values, this.action, submitOptions)
      }
      else {
        return false
      }
    })
  }

  parseValues (value: Record<string, any>) {
    if (this.merge) {
      for (let [key, val] of Object.entries(this.merge)) {
        set(value, key, pick(value, val))
      }
    }
    let values = this.exclude ? omit(value, this.exclude) : value
    let items = this.columns.filter( r => ['datetimerange', 'daterange', 'monthrange'].includes(r.type!) )
    for (let item of items) {
      let itemArr = item.key.split(/(\_){2}/)
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
    this.$emit('reset', this.DefaultValues)
    this.values = cloneDeep(this.DefaultValues)
    this.selectedDraft = ''
  }
  
}
</script>