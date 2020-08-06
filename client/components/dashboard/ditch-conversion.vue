<template>
  <div>
    <div class="form-container">
      <h2>数据转换 : {{ title }}</h2>
      <dashboard-form
        :default-values="{ separator: '=' }"
        :rules="{
          separator: [
            { required: true, message: '请输入分隔符' }
          ]
        }"
        :columns="[
          {
            key: 'separator',
            name: '分隔符',
            type: 'input',
            placeholder: '请输入分隔符',
            default: '='
          },
          {
            key: 'content',
            name: '源数据',
            type: 'textarea',
            placeholder: '请输入源数据'
          }
        ].concat(getColumns())"
        submit-name="转换"
        @submit="handleConversion"
        :no-back="true" />
      <section class="container" >
        <client-only placeholder="Codemirror Loading...">
          <codemirror v-model="code" style="height: 500px"
            :options="cmOption" >
          </codemirror>
        </client-only>
      </section>
    </div>
    <!-- 底部操作区 -->
    <dashboard-footer-bar v-if="showFooter" :visible="showFooter">
      <el-button type="primary" style="margin-left:15px" @click="handleSubmit" :loading="loading" :disabled="data.length === 0">提交</el-button>
      <el-button type="success" style="margin-left:15px" @click="$emit('goback', null)">返回</el-button>
    </dashboard-footer-bar>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from 'nuxt-property-decorator'
import 'codemirror/theme/duotone-light.css'
import { isEmpty, trim, zipObject, set, isNumber } from 'lodash'
import { Maps } from 'kenote-config-helper'
import { oc } from 'ts-optchain'
import { Channel } from '@/types/channel'
import * as yaml from 'js-yaml'
import { isYaml } from '@/utils'

interface Conversion {
  separator      : string
  content       ?: string
}

@Component<DashboardDitchConversion>({
  name: 'dashboard-ditch-conversion',
  created () {
    this.showFooter = true
  }
})
export default class DashboardDitchConversion extends Vue {
  
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: '' }) title!: string
  @Prop({ default: {} }) options!: Maps<any>

  @Provide() showFooter: boolean = false
  @Provide() data: Maps<any>[] = []
  @Provide() code: string = ''
  @Provide() cmOption: any = {
    tabSize: 2,
    foldGutter: true,
    styleActiveLine: true,
    lineNumbers: true,
    line: true,
    keyMap: "sublime",
    mode: 'application/json',
    theme: 'duotone-light',
    readOnly: true,
  }

  getColumns (): Channel.queryer[] {
    let fields = oc(this.options).fields([]).filter( o => !['key', 'name'].includes(o) ) as string[]
    let colums: Channel.queryer[] = []
    for (let item of fields) {
      colums.push({
        key: item.replace(/\./, '$'),
        name: '附加值',
        type: 'textarea',
        placeholder: `请输入附加值 ${item}`
      })
    }
    return colums
  }

  handleConversion (values: Maps<any>): void {
    let { separator, content } = values
    let fields = oc(this.options).fields([]) as string[]
    let plusFields = fields.filter( o => !['key', 'name'].includes(o) )
    let data: any[] = []
    let plusValue = this.getPlusValues(values, separator)
    if (content) {
      let contentArray = content.split(/\n/)
      for (let item of contentArray) {
        if (!isEmpty(item)) {
          let value = item.split(new RegExp(separator)).map(trim)
          let obj: Maps<any> = {}
          obj = zipObject(fields, value)
          let { key } = obj 
          for (let field of plusFields) {
            let val = oc(plusValue)[field][key]()
            if (val) {
              set(obj, field.split(/\./), val)
            }
          }
          data.push(obj)
        }
      }
    }
    this.data = data
    this.code = JSON.stringify(data, null, 2)
  }

  getPlusValues (values: Maps<any>, separator: string = '='): Maps<any> {
    let data: Maps<any> = {}
    let fields = oc(this.options).fields([]).filter( o => !['key', 'name'].includes(o) ) as string[]
    for (let key of fields) {
      let value = oc(values)[key.replace(/\./, '$')]('')
      data[key] = toObject(value, separator)
    }
    return data
  }

  handleSubmit (): void {
    let value = yaml.dump(this.data)
    if (!isYaml(value)) {
      this.$message.warning('数据格式有误！')
      return
    }
    this.$emit('submit', value)
  }
  
}

function toObject (value: string, separator: string = '='): Maps<any> {
  let values = value.split(/\n/)
  let data: Maps<any> = {}
  for (let item of values) {
    let [ key, name ] = item.split(new RegExp(separator)).map(trim)
    if (/^(\d){1}$/.test(key)) {
      key = `0${key}`
    }
    data[key] = Number(name) || name
  }
  return data
}
</script>