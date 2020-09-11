<template>
  <div>
    <div class="form-container">
      <h2>导入配置 : {{ title }}</h2>
      <dashboard-table 
        :columns="[
          {
            key: 'name',
            name: '文件名'
          },
          {
            key: 'size',
            name: '文件大小',
            format: [
              {
                type: 'number',
                function: 'bytes'
              }
            ]
          },
          {
            key: 'lastModified',
            name: '最后修改时间',
            format: [
              {
                type : 'date',
                function: 'toLocaleString',
                options: [ 'zh', {
                  hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric'
                }]
              },
              {
                type: 'string',
                function: 'replace',
                options: [ /\//g, '-' ]
              }
            ]
          }
        ]"
        :data="files"
        :flag="{}"
        />
      <el-form v-if="files.length > 0">
        <el-form-item>
          <el-select v-model="values.sheetName" @change="handleSheetNamesChange">
            <el-option v-for="(sheetName, key) in sheetNames" :key="key" :label="sheetName" :value="sheetName"></el-option>
          </el-select>
          <el-input-number v-model="values.start" :min="1" ></el-input-number>
        </el-form-item>

        <el-form-item>
          <el-table :data="[{}]">
            <el-table-column v-for="(item, key) in options.fields || []" 
              :key="key"
              :label="item"
              :width="240"
              :fixed="key === 0" >
              <el-select v-model="values[item]">
                <el-option v-for="(field, key) in sheetFields" :key="key" :label="field" :value="field"></el-option>
              </el-select>
            </el-table-column>
            <el-table-column 
              label=""
              :min-width="180"
              fixed="right" >
              <el-button type="primary" @click="handleConvert">转换</el-button>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item>
          <dashboard-codemirror v-model="code" theme="duotone-light" type="application/json" wrapperStyle="height:500px" :read-only="true" />
        </el-form-item>
      </el-form>
    </div>
    <!-- 底部操作区 -->
    <dashboard-footer-bar v-if="showFooter" :visible="showFooter">
      <dashboard-file-picker
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        @change="handleFileChange"
        />
      <el-button type="primary" style="margin-left:15px" @click="handleSubmit" :loading="loading" :disabled="data.length === 0">提交</el-button>
      <el-button type="success" style="margin-left:15px" @click="$emit('goback', null)">返回</el-button>
    </dashboard-footer-bar>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from 'nuxt-property-decorator'
import * as xlsx from 'xlsx'
import { readXlsxFileReader, getXlsxFields, getXlsxSheet } from '@/utils/xlsx'
import { Maps } from 'kenote-config-helper'
import { omit, set, map, compact } from 'lodash'
import { oc } from 'ts-optchain'
import * as yaml from 'js-yaml'
import { isYaml } from '@/utils'

@Component<DashboardXlsxImport>({
  name: 'dashboard-xlsx-import',
  created () {
    this.showFooter = true
  }
})
export default class DashboardXlsxImport extends Vue {
  
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: '' }) title!: string
  @Prop({ default: {} }) options!: Maps<any>

  @Provide() showFooter: boolean = false
  @Provide() files: File[] = []
  @Provide() workbook: xlsx.WorkBook | undefined = undefined
  @Provide() sheetNames: string[] = []
  @Provide() sheetFields: string[] = []
  @Provide() values: Maps<string | number> = { start: 1 }
  @Provide() code: string = ''
  @Provide() data: Maps<any>[] = []

  async handleFileChange (files: File[]): Promise<void> {
    this.files = files
    let workbook = await readXlsxFileReader(files[0])
    this.workbook = workbook
    this.sheetNames = workbook.SheetNames
    this.sheetFields = []
    this.values = { start: 1 }
    this.code = ''
  }

  handleSheetNamesChange (name: string): void {
    this.sheetFields = getXlsxFields(this.workbook!, name)
  }

  handleConvert (): void {
    let { sheetName, start } = this.values
    let values = omit(this.values, [ 'sheetName', 'start' ]) as Maps<string>
    setTimeout(() => {
      let sheet = getXlsxSheet(this.workbook!, sheetName as string)
      let data: Maps<any>[] = []
      for (let key in sheet) {
        let index = Number(key.replace(/^([A-Z])/, ''))
        let reg = new RegExp(`^(${values['key']})`)
        if (reg.test(key) && index >= start) {
          data.push(setItem(values, sheet, index))
        }
      }
      let groups = compact([...new Set(map(data, 'group'))])
      if (groups.length > 0) {
        let _data: Maps<any>[] = []
        for (let group of groups) {
          _data.push({
            key: group,
            name: group,
            children: data.filter( o => o.group === group ).map( o => omit(o, ['group']) )
          })
        }
        data = _data
      }
      this.data = data
      this.code = JSON.stringify(data, null, 2)
    }, 300)
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

function setItem (fields: Maps<string>, sheet: xlsx.WorkSheet, index: number): Maps<any> {
  let data: Maps<any> = {}
  for (let key in fields) {
    set(data, key, oc(sheet)[`${fields[key]}${index}`].v())
  }
  return data
}
</script>

<style lang="scss" >
.form-container .container {
  margin-top: 30px;
  line-height: initial;
  font-size: 12px;

  .CodeMirror {
    height: 100%;
    border: 1px #999999 solid;
  }
}
</style>