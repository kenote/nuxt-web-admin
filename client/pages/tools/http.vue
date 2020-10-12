<template>
  <dashboard-page v-loading="initinal">
    <el-tabs v-model="tabKey" type="card" editable @edit="handleTabsEdit">
      <el-tab-pane v-for="(item, key) in httpRequests" :key="item.key" :name="item.key" :label="item.name || oc(item).request.method('').toUpperCase() + ` [${key}]`" :lazy="true">
        <dashboard-http-request 
          :api="item.request" 
          :http-proxy="httpProxy"
          :token="token"
          @change="fetch => handleChange(key, fetch)"
          @submit="fetch => handleSubmit(key, fetch)" 
           />
        <dashboard-http-response 
          :data="item.response" 
          @cancel="() => handleCancel(item)"
          :loading="item.loading" />
      </el-tab-pane>
    </el-tabs>
    <!-- 底部操作区 -->
    <dashboard-footer-bar v-if="showFooter" :visible="showFooter">
      <el-button type="warning" @click="handleProxy">设置代理</el-button>
      <el-button type="primary" @click="handleSave">保存配置</el-button>
    </dashboard-footer-bar>
    <!--  -->
    <dashboard-http-proxy 
      :visible="dialogProxyVisible"
      :default-values="httpProxy"
      @submit="handleProxySubmit"
      @close="handleProxyDialog"
      @visible-change="handleProxyVisible"
      />
  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, mixins, Provide } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import * as uuid from 'uuid'
import { Channel } from '@/types/channel'
import * as api from '~/api'
import { Dictionary, result, cloneDeep, findIndex, unset, remove } from 'lodash'
import axios, { AxiosResponse, AxiosProxyConfig, CancelTokenSource } from 'axios'
import { HttpResponse, HttpRequest, HeaderOptions, HttpRequestBase, HttpRequestConfig } from '@/utils/http'
import * as yaml from 'js-yaml'
import * as urlParse from 'url-parse'
import { TryStatement } from '@/build'

@Component<ToolsHttpPage>({
  name: 'tools-http-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
  created () {
    this.handleGetConfig()
  }
})
export default class ToolsHttpPage extends mixins(PageMixin) {
  
  @Provide() tabKey: string = uuid.v4()
  @Provide() httpRequests: HttpRequest[] = [
    {
      key: this.tabKey,
      name: '',
      request: { method: 'get', url: '' },
      response: null,
      loading: false
    }
  ]
  @Provide() showFooter: boolean = true
  @Provide() httpProxy: AxiosProxyConfig | false = false
  @Provide() dialogProxyVisible: boolean = false

  handleMethod (index: number, method: string): void {
    this.httpRequests[index].name = method.toUpperCase() + ` [${index}]`
  }

  handleChange (index: number, fetch: Channel.api): void {
    let { method } = fetch
    this.httpRequests[index].name = method.toUpperCase() + ` [${index}]`
    this.httpRequests[index].request = fetch
  }

  handleTabsEdit (key: string | null, action: string): void {
    if (action === 'add') {
      let activeName = uuid.v4()
      this.httpRequests.push({
        key: activeName,
        name: '',
        request: { method: 'get', url: '' },
        response: null,
        loading: false
      })
      this.tabKey = activeName
    }
    if (action === 'remove') {
      let httpRequests = cloneDeep(this.httpRequests)
      if (httpRequests.length === 1) {
        return
      }
      let activeName = cloneDeep(this.tabKey)
      httpRequests.forEach( (httpRequest, index) => {
        if (httpRequest.key === key) {
          let nextTab = httpRequests[index + 1] || httpRequests[index - 1]
          if (nextTab) {
            activeName = nextTab.key
          }
        }
      })
      if (this.tabKey != activeName) {
        this.tabKey = activeName
      }
      
      this.httpRequests = httpRequests.filter( o => o.key != key )
    }
  }

  handleSubmit (index: number, content: Channel.api): void {
    let { params } = content
    content.options = {
      ...content.options,
      proxy: this.httpProxy
    }
    if (Object.prototype.toString.call(params) === '[object FormData]') {
      this.handleUpload(index, content)
      return
    }
    this.httpRequests[index].loading = true
    this.httpRequests[index].cancelTokenSource = axios.CancelToken.source()
    let fetch: Channel.api = {
      method: 'post',
      url: '/api/v1/tools/http',
      params: {
        fetch: yaml.dump(content)
      },
      options: {
        cancelToken: this.httpRequests[index].cancelTokenSource?.token
      }
    }
    let headers: any = {}
    setTimeout(async () => {
      try {
        let result = await api.getData(fetch)
        if (result.error === 0) {
          let { data, headers: header } = result.data as HttpResponse
          headers = header
          let contentType = headers['Content-Type'] || headers['content-type']
          if (/(text|json|javascript)/.test(contentType)) {
            this.httpRequests[index].response = { data, headers }
          }
          else if (data) {
            
          }
          else if (/^(image)/.test(contentType)) {
            let contentLength = headers['Content-Length'] || '0'
            let progress: ((percentage: number) => void) | undefined = undefined
            let options: HeaderOptions = {
              ...content.options,
              download: progress,
              total: Number(contentLength)
            }
            let file = await api.downloadFile(content.url, null, content.options!) 
            this.httpRequests[index].response = { data: file, headers, progress }
          }
          else {
            this.httpRequests[index].response = { data: `[${contentType}] 此类型不支持展示`, headers }
          }
          
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.httpRequests[index].response = {
          data: error.message,
          headers
        }
        this.$message.warning(error.message)
      }
      this.httpRequests[index].loading = false
    }, 300)
  }

  handleUpload (index: number, fetch: Channel.api): void {
    let { url, params } = fetch
    this.httpRequests[index].loading = true
    setTimeout(async () => {
      try {
        let result: HttpResponse = {}
        let options: HeaderOptions = {
          ...fetch.options,
          done: response => {
            let { data, headers } = response
            result = { data, headers }
          },
          cancelToken: this.httpRequests[index].cancelTokenSource?.token
        }
        await api.uploadFile(url, params, options)
        this.httpRequests[index].response = result
      } catch (error) {
        this.httpRequests[index].response = {
          data: error.message,
          headers: {}
        }
        this.$message.warning(error.message)
      }
      this.httpRequests[index].loading = false
    }, 300)
  }

  handleCancel (httpRequest: HttpRequest): void {
    httpRequest.cancelTokenSource?.cancel('用户中断了请求')
    let index = findIndex(this.httpRequests, o => o.key === this.tabKey)
    this.httpRequests[index].loading = false
  }

  handleSave (): void {
    let httpRequest = cloneDeep(this.httpRequests).map( o => {
      let { key, name, request } = o
      let { params } = request
      if (Object.prototype.toString.call(params) === '[object FormData]') {
        o.request.params = {}
      }
      let item: HttpRequestBase = {
        key,
        name,
        request
      }
      return item
    })
    let config: HttpRequestConfig = {
      httpRequest,
      httpProxy: this.httpProxy
    }
    this.loading = true
    setTimeout(async () => {
      try {
        let fetch: Channel.api = {
          method: 'post',
          url: '/api/v1/plan/http-request',
          params: {
            content: yaml.dump(config)
          },
          options: this.httpOptions
        }
        let result = await api.getData(fetch)
        if (result.error === 0) {
          
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
      this.loading = false
    }, 300)
  }

  handleGetConfig (): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let fetch: Channel.api = {
          method: 'get',
          url: '/api/v1/plan/http-request',
          options: this.httpOptions
        }
        let result = await api.getData(fetch)
        if (result.error === 0) {
          let { httpRequest, httpProxy } = result.data as HttpRequestConfig
          if (httpRequest.length > 0) {
            this.httpRequests = httpRequest.map( o => {
              return { ...o, response: null, loading: false }
            })
            this.tabKey = httpRequest[0].key
          }
          this.httpProxy = httpProxy!
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
      this.loading = false
    }, 300)
  }

  handleProxy (): void {
    this.dialogProxyVisible = true
  }

  handleProxyDialog () {

  }

  handleProxyVisible (visible: boolean): void {
    this.dialogProxyVisible = visible
  }

  handleProxySubmit (values: AxiosProxyConfig | false): void {
    console.log(values)
    this.httpProxy = values
    this.handleProxyVisible(false)
  }
}


</script>