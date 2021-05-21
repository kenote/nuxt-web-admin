<template>
  <div class="form-container">
    <h2>{{ name }}</h2>
    <el-row :gutter="20">
      <el-col :span="display ? 12 : 24">
        <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="handleSubmit" label-width="150px" v-loading="loading">
          <template v-if="columns">
            <el-form-item v-for="(item, key) in columns" 
              :key="key" 
              :prop="item.type === 'avatar-picker' ? undefined : item.key" 
              :label="item.name" 
              :rules="rules[item.key]" 
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
                :disabled="item.disabled"
                :request="item.request"
                :avatar-options="options && options.avatar"
                @get-data="getData"
                @upload-file="uploadFile"
                @change="isChange && $emit('change', parseValues(values))"
                />
            </el-form-item>
          </template>
          <el-form-item v-if="!isChange">
            <el-button type="primary" native-type="submit" :loading="loading">{{ submitName }}</el-button>
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
import { Component, Vue, Prop, Provide, Emit, Watch } from 'nuxt-property-decorator'
import { cloneDeep, omit } from 'lodash'
import { Verify, Channel } from '@/types/client'
import { Form as ElForm } from 'element-ui'
import { zipObject, unset } from 'lodash'
import { formatData, ParseData, parseBody } from 'parse-string'

@Component<WebForm>({
  name: 'web-form',
  created () {
    this.values = cloneDeep(this.defaultValues ?? {})
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
  valueFormat!: Record<string, ParseData.format>

  @Provide()
  values: Record<string, any> = {}

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
        let values = this.parseValues(this.values)
        this.submit(values, this.action, this.submitOptions)
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
  }
  
}
</script>