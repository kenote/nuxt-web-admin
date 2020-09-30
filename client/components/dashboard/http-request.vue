<template>
  <div>
    <el-form ref="theForm" @submit.native.prevent="handleSubmit">
      <el-input placeholder="请输入内容" v-model="url" class="input-with-select">
        <el-select v-model="method" slot="prepend" placeholder="请选择" style="width:100px">
          <el-option label="GET" value="get"></el-option>
          <el-option label="POST" value="post"></el-option>
          <el-option label="PUT" value="put"></el-option>
          <el-option label="DELETE" value="delete"></el-option>
        </el-select>
        <el-button slot="append" icon="el-icon-position" native-type="submit">SEND</el-button>
      </el-input>
    </el-form>

    <el-tabs v-model="requestTag">
      <el-tab-pane label="Params" name="params">
        <dashboard-http-keymap :data="params" type="params" @change="handleParamsChange" :max-height="375" >
          <el-link type="warning" @click="handleTimestamp">[时间戳]</el-link>
        </dashboard-http-keymap>
      </el-tab-pane>
      <el-tab-pane label="Headers" name="headers">
        <dashboard-http-keymap :data="headers" type="headers" @change="handleHeadersChange" :max-height="375" >
          <el-link type="warning" @click="handleSetAuth">[auth]</el-link>
        </dashboard-http-keymap>
      </el-tab-pane>
      <el-tab-pane label="Body" name="body" :disabled="method === 'get'">
        <el-radio-group v-model="bodyMode" style="margin-bottom: 10px">
          <el-radio label="x-www-form-urlencoded">x-www-form-urlencoded</el-radio>
          <el-radio label="form-data" :disabled="method != 'post'">form-data</el-radio>
        </el-radio-group>
        <dashboard-http-keymap v-if="bodyMode === 'form-data'" :data="body['form-data']" type="body" @change="val => handleBodyChange(val, 'form-data')" :form-data="true" :max-height="375" />
        <dashboard-http-keymap v-else :data="body['x-www-form-urlencoded']" type="body" @change="val => handleBodyChange(val, 'x-www-form-urlencoded')" :max-height="375" />
      </el-tab-pane>
    </el-tabs>
    <el-input 
      type="textarea"
      v-model="shell"
      placeholder="shell 脚本"
      :autosize="{ minRows: 4, maxRows: 4 }"
      style="margin-top:10px"
      resize="none"
      readonly
      />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { Channel } from '@/types/channel'
import * as urlParse from 'url-parse'
import * as qs from 'query-string'
import { queryToCollection, collectionToQuery, paramToCollection } from '@/utils'
import { KeyMap } from 'kenote-config-helper'
import { HeaderOptions } from '@/utils/http'
import { Dictionary, cloneDeep } from 'lodash'
import * as yaml from 'js-yaml'
import { oc } from 'ts-optchain'
import { AxiosProxyConfig } from 'axios'
import { fetchToShell } from '@/utils'

type RequestTags = 'params' | 'headers' | 'body'
type BodyModes = keyof BodyPayload

interface BodyPayload {
  'x-www-form-urlencoded': KeyMap<any>[]
  'form-data': PayloadMap[]
}

interface PayloadMap extends KeyMap<any> {
  type   ?: string
  file   ?: File
}

@Component<DashboardHttpRequest>({
  name: 'dashboard-http-request',
  created () {
    let { method, url, params, options } = this.api
    let { header } = options || {}
    this.method = method
    this.url = url
    this.headers = paramToCollection(header || {}) as KeyMap<any>[]
    if (method === 'get') {
      this.body = { 'x-www-form-urlencoded': [], 'form-data': [] }
      this.params = queryToCollection(url) as KeyMap<any>[]
    }
    else {
      this.requestTag = 'body'
      this.params = queryToCollection(url) as KeyMap<any>[]
      this.body = { 'x-www-form-urlencoded': paramToCollection(params || {}) as KeyMap<any>[], 'form-data': [] }
    }
  }
})
export default class DashboardHttpRequest extends Vue {
  
  @Prop({ default: { method: 'get', url: '' } }) api!: Channel.api
  @Prop({ default: false }) httpProxy!: AxiosProxyConfig | false
  @Prop({ default: undefined }) token!: string

  @Provide() method: Channel.methodTypes = 'get'
  @Provide() url: string = ''
  @Provide() params: KeyMap<any>[] = []
  @Provide() headers: KeyMap<any>[] = []
  @Provide() body: BodyPayload = { 'x-www-form-urlencoded': [], 'form-data': [] }
  @Provide() requestTag: RequestTags = 'params'
  @Provide() bodyMode: BodyModes = 'x-www-form-urlencoded'
  @Provide() shell: string = ''

  @Watch('method')
  onMethodChange (val: Channel.methodTypes, oldVal: Channel.methodTypes): void {
    if (val === 'get' && this.requestTag === 'body') {
      this.requestTag = 'params'
      this.bodyMode = 'x-www-form-urlencoded'
    }
    if (this.requestTag === 'body' && val != 'post') {
      this.bodyMode = 'x-www-form-urlencoded'
    }
    this.shell = this.toSell()
    this.$emit('method', val)
  }

  @Watch('url')
  onUrlChange (val: string, oldVal: string): void {
    if (val === oldVal) return
    this.params = queryToCollection(val) as KeyMap<any>[]
    this.shell = this.toSell()
  }

  @Watch('bodyMode')
  onBodyModeChange (val: BodyModes, oldVal: BodyModes): void {
    this.shell = this.toSell()
  }

  @Watch('httpProxy')
  onHttpProxy (val: AxiosProxyConfig | false, oldVal: AxiosProxyConfig | false): void {
    this.shell = this.toSell()
  }

  handleParamsChange (values: KeyMap<any>[]): void {
    let { url } = qs.parseUrl(this.url)
    let query = collectionToQuery(values)
    this.url = `${url}${query}`
  }

  handleHeadersChange (values: KeyMap<any>[]): void {
    this.headers = values.filter( o => o.key || o.name )
    this.shell = this.toSell()
  }

  handleBodyChange (values: PayloadMap[], mode: BodyModes): void {
    this.body[mode] = values.filter( o => o.key || o.name )
    this.shell = this.toSell()
  }

  handleSubmit (): void {
    this.$emit('submit', this.handleReadyValues())
  }

  handleReady (): void {
    this.$emit('change', this.handleReadyValues())
  }

  handleReadyValues (): Channel.api {
    let fetch: Channel.api = {
      method: this.method,
      url: this.url
    }
    let header = qs.parse(collectionToQuery(this.headers.filter( o => o.key )))
    let options: HeaderOptions = {
      header
    }
    if (this.method === 'get') {
      fetch.params = {}
    }
    else {
      if (this.bodyMode === 'form-data') {
        oc(options).header({})['Content-Type'] = 'multipart/form-data'
        let formData = new FormData()
        for (let item of this.body['form-data']) {
          let { key, type, file, name } = item
          if (key) {
            let loc = this.body['form-data'].filter( o => o.key === key )
            formData.append(loc.length > 1 ? `${key}[]` : `${key}`, file || name)
          }
        }
        fetch.params = formData
      }
      else {
        fetch.params = qs.parse(collectionToQuery(this.body['x-www-form-urlencoded'].filter( o => o.key )))
      }
    }
    fetch.options = options
    return fetch
  }

  handleSetAuth (): void {
    let token = this.token ? `Bearer ${this.token}` : this.token
    let index = this.headers.findIndex(o => o.key === 'Authorization')
    if (index >= 0) {
      let headers = cloneDeep(this.headers)
      headers[index].name = token
      this.headers = headers
    }
    else {
      this.headers.push({ key: 'Authorization', name: token })
    }
    this.shell = this.toSell()
  }

  handleTimestamp (): void {
    let index = this.params.findIndex( o => /^(\d){10,13}$/.test(o.key))
    if (index >= 0) {
      this.params[index].key = String(Date.now())
    }
    else {
      this.params.push({ key: String(Date.now()), name: null })
    }
    this.handleParamsChange(this.params)
  }

  toSell (): string {
    this.handleReady()
    let shell: string = ''
    if (this.bodyMode === 'form-data') {
      return `不支持 form-data 方式`
    }
    let fetch: Channel.api = {
      method: this.method,
      url: this.url,
      params: qs.parse(collectionToQuery(this.body['x-www-form-urlencoded'])),
      options: {
        header: qs.parse(collectionToQuery(this.headers)),
        proxy: this.httpProxy
      }
    }
    return fetchToShell(fetch)
  }

}
</script>