<template>
  <div v-if="loading" class="http-loading">
    <i class="el-icon-loading"></i>
    <h3>Sending Request ...</h3>
    <el-button size="small" @click="$emit('cancel')">Cancel</el-button>
  </div>
  <div v-else>
    <el-tabs v-model="responseTag">
      <el-tab-pane label="Body" name="body">
        <dashboard-codemirror class="http-response" v-model="body" theme="duotone-light" :type="contentType"  :read-only="true" />
      </el-tab-pane>
      <el-tab-pane label="Preview" name="preview" :disabled="!/(image|html)/.test(contentType)">
        <iframe ref="iframe" border="0" frameborder=“no” style="width: 100%;height:460px;border:1px solid #ccc">
          </iframe>
      </el-tab-pane>
      <el-tab-pane label="Headers" name="headers">
        <dashboard-http-keymap :data="headers" type="headers" :read-only="true" :max-height="435" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Provide } from 'nuxt-property-decorator'
import { AxiosResponse } from 'axios'
import { queryToCollection, collectionToQuery, paramToCollection } from '@/utils'
import { KeyMap } from 'kenote-config-helper'
import { oc } from 'ts-optchain'
import { isString } from 'lodash'
import { render } from 'node-sass'

@Component<DashboardHttpResponse>({
  name: 'dashboard-http-response'
})
export default class DashboardHttpResponse extends Vue {

  @Prop({ default: undefined }) data!: AxiosResponse<any>
  @Prop({ default: false }) loading!: boolean

  @Provide() responseTag: string = 'body'
  @Provide() headers: KeyMap<any>[] = []
  @Provide() body: string = ''
  @Provide() contentType: string = 'text/plain'

  @Watch('data')
  async onDataChange (val: AxiosResponse<any>, oldVal: AxiosResponse<any>): Promise<void> {
    this.responseTag = 'body'
    this.headers = paramToCollection(val.headers, true) as KeyMap<any>[]
    let contentType = this.headers.find( o => o.key.toLowerCase() === 'content-type')?.name || 'text/plain'
    let [ type, charset ] = contentType.split(';')
    this.contentType = type
    if (Object.prototype.toString.call(val.data) === '[object Blob]') {
      let { type } = val.data as Blob
      let base64str = await blobToBase64(val.data)
      if (/^(image)/.test(type)) {
        this.body = String(base64str)
        setTimeout(() => {
          this.responseTag = 'preview'
        }, 0)
      }
    }
    else {
      this.body = isString(val.data) ? val.data : JSON.stringify(val.data, null, 2)
    }
    
  }

  @Watch('responseTag')
  async onResponseTagChange (val: string, oldVal: string): Promise<void> {
    if (val === 'preview') {
      let iframe = this.$refs['iframe'] as HTMLIFrameElement
      if (oc(iframe).contentDocument()) {
        if (Object.prototype.toString.call(this.data.data) === '[object Blob]') {
          let { type } = this.data.data as Blob
          if (/^(image)/.test(type)) {
            iframe.contentDocument!.documentElement.innerHTML = `<img src="${this.body}" />`
          }
        }
        else {
          iframe.contentDocument!.documentElement.innerHTML = this.body
        }
        
      }
    }
  }
  
}

function blobToBase64 (blob) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = (err: any) => {
      reject(err)
    }
    reader.readAsDataURL(blob)
  })

}
</script>

<style lang="scss">
.http-loading {
  margin-top: 15px;
  width: 100%;
  min-height: 300px;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  i {
    font-size: 24px;
  }
}
.http-response {
  .CodeMirror {
    border: 1px solid #cdcdcd;
    min-height: 450px;
  }
}
</style>