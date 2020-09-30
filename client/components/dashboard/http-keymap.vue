<template>
  <el-table ref="theTable" class="http-keymap" :data="pdata" border :max-height="maxHeight" :height="height">
    <el-table-column prop="key" label="KEY" width="300">
      <template slot-scope="scope">
        <span v-if="readOnly">{{ pdata[scope.$index].key }}</span>
        <el-input v-else-if="formData" placeholder="请输入内容" v-model="pdata[scope.$index].key" @input="val => handleChange(val, scope.$index, scope.row)" class="input-with-select">
          <el-select v-model="pdata[scope.$index].type" slot="append" placeholder="请选择" style="width:100px;margin-right:-30px">
            <el-option label="TEXT" value="text"></el-option>
            <el-option label="FILE" value="file"></el-option>
          </el-select>
        </el-input>
        <el-autocomplete v-else-if="type === 'headers'" 
          v-model="pdata[scope.$index].key" 
          :trigger-on-focus="false"
          :fetch-suggestions="querySearchHeaderKey"
          @input="val => handleChange(val, scope.$index, scope.row)"
          style="width:100%"
          />
        <el-input v-else v-model="pdata[scope.$index].key" @input="val => handleChange(val, scope.$index, scope.row)" />
      </template>
    </el-table-column>
    <el-table-column prop="name" label="VALUE">
      <template slot="header" slot-scope="scope">
        <span :key="scope.$index">VALUE</span>
        <div style="float:right;height:20px;overflow:hidden">
          <slot></slot>
        </div>
      </template>
      <template slot-scope="scope">
        <span v-if="readOnly">{{ pdata[scope.$index].name }}</span>
        <template v-else-if="pdata[scope.$index].type === 'file'">
          <dashboard-file-input v-model="pdata[scope.$index].file" @update="val => handleChange(val, scope.$index, scope.row)" />
        </template>
        <el-autocomplete v-else-if="type === 'headers'" 
          v-model="pdata[scope.$index].name" 
          :trigger-on-focus="false"
          :fetch-suggestions="(queryString, cb) => querySearchHeaderName(scope.$index, queryString, cb)"
           @input="val => handleChange(val, scope.$index, scope.row)"
          style="width:100%"
          />
        <el-input v-else v-model="pdata[scope.$index].name" @input="val => handleChange(val, scope.$index, scope.row)" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts">
import { Maps } from 'kenote-config-helper'
import { Component, Vue, Provide, Prop, Watch } from 'nuxt-property-decorator'
import { isArray, cloneDeep, last, isEqual, isString } from 'lodash'
import { Table as ElTable } from 'element-ui'
import { KeyMap } from 'kenote-config-helper'

type RequestTags = 'params' | 'headers' | 'body'

interface PayloadMap extends KeyMap<any> {
  type   ?: string
  file   ?: File
}

@Component<DashboardHttpKeymap>({
  name: 'dashboard-http-keymap',
  created () {
    let data = cloneDeep(this.data)
    if (this.readOnly) {
      this.pdata = data
      return
    }
    if (this.formData) {
      data.push({ key: '', name: '', type: 'text' })
    }
    else {
      data.push({ key: '', name: '' })
    }
    this.pdata = data
    this.inputTypes = data.map( o => 'text' )
  },
  mounted () {
    
  }
})
export default class DashboardHttpKeymap extends Vue {
  
  @Prop({ default: [] }) data!: PayloadMap[]
  @Prop({ default: 'params' }) type!: RequestTags
  @Prop({ default: false }) formData!: boolean
  @Prop({ default: false }) readOnly!: boolean
  @Prop({ default: undefined }) maxHeight!: number | string
  @Prop({ default: undefined }) height!: number | string

  @Provide() pdata: PayloadMap[] = []
  @Provide() method: any = 'text'
  @Provide() inputTypes: string[] = []

  @Watch('data')
  onDataChange(val: PayloadMap[], oldVal: PayloadMap[]): void {
    let data = cloneDeep(val)
    if (this.readOnly) {
      this.pdata = data
      return
    }
    if (this.formData) {
      data.push({ key: '', name: '', type: 'text' })
    }
    else {
      data.push({ key: '', name: '' })
    }
    this.pdata = data
  }

  handleChange (val: any, index: number, row: PayloadMap): void {
    this.$emit('change', this.pdata)
    if (this.pdata.length === index + 1) {
      if (this.formData) {
        this.pdata.push({ key: '', name: '', type: 'text' })
      }
      else {
        this.pdata.push({ key: '', name: '' })
      }
    }
  }

  querySearchHeaderKey (queryString: string, cb: (list: Record<'value', string>[]) => void): void {
    let options = [
      'Authorization',
      'Content-Type',
    ].map( value => ({ value }))
    let results = queryString ? options.filter( o => o.value.toLowerCase().includes(queryString.toLowerCase()) ) : options
    cb(results)
  }

  querySearchHeaderName (index: number, queryString: string, cb: (list: Record<'value', string>[]) => void): void {
    let results: Record<'value', string>[] = []
    if (this.pdata[index].key.toLowerCase() === 'content-type') {
      let options = [
        'application/atom+xml',
        'application/ecmascript',
        'application/json',
        'application/vnd.api+json',
        'application/javascript',
        'application/octet-stream',
        'application/ogg',
        'application/pdf',
        'application/postscript',
        'application/rdf+xml',
        'application/rss+xml',
        'application/soap+xml',
        'application/font-woff',
        'application/x-yaml',
        'application/xhtml+xml',
        'application/xml',
        'application/xml-dtd',
        'application/xop+xml',
        'application/zip',
        'application/gzip',
        'application/graphql',
        'application/x-www-form-urlencoded',
        'audio/basic',
        'audio/L24',
        'audio/mp4',
        'audio/mpeg',
        'audio/ogg',
        'audio/vorbis',
        'audio/vnd.rn-realaudio',
        'audio/vnd.wave',
        'audio/webm',
        'image/gif',
        'image/jpeg',
        'image/pjpeg',
        'image/png',
        'image/svg+xml',
        'image/tiff',
        'message/http',
        'message/imdn+xml',
        'message/partial',
        'message/rfc822',
        'multipart/mixed',
        'multipart/alternative',
        'multipart/related',
        'multipart/form-data',
        'multipart/signed',
        'multipart/encrypted',
        'text/cmd',
        'text/css',
        'text/csv',
        'text/html',
        'text/plain',
        'text/vcard',
        'text/xml',
      ].map( value => ({ value }))
      results = queryString ? options.filter( o => o.value.toLowerCase().includes(queryString.toLowerCase()) ) : options
    }
    cb(results)
  }
}
</script>