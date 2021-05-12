<template>
  <div id="vditor" v-bind:class="disabled ? 'disabled' : ''" />
</template>

<script lang="ts">
import { Component, Vue, Model, Watch , Emit, Prop, Provide, mixins } from 'nuxt-property-decorator'
import Vditor from 'vditor'
import { isBoolean, isEmpty, zipObject, map, merge, get } from 'lodash'
import { HttpClientOptions, getHeaders, HttpResult } from '@/utils/http-client'
import { EditorConfig } from '@/types/client'

@Component<WebVditor>({
  name: 'web-vditor',
  mounted () {
    this.initialEditor()
  },
  beforeDestroy () {
    this.contentEditor?.destroy()
  }
})
export default class WebVditor extends Vue {

  @Prop({ default: undefined })
  placeholder!: string

  @Prop({ default: false })
  disabled!: boolean

  @Prop({ default: undefined })
  minHeight!: number

  @Prop({ default: undefined })
  height!: number | string

  @Prop({ default: undefined })
  width!: number | string

  @Prop({ default: undefined })
  upload!: {
    url         ?: string
    headers     ?: IObject
    format      ?: string[]
    max         ?: number
    accept      ?: string
    multiple    ?: boolean
    fieldName   ?: string
  }

  @Prop({ default: undefined })
  counter!: {
    enable   : boolean
    max     ?: number
    type    ?: 'markdown' | 'text'
    after?(length: number, counter: {
      enable   : boolean
      max     ?: number
      type    ?: 'markdown' | 'text'
    }): void
  }

  @Prop({ default: undefined })
  httpOptions!: HttpClientOptions

  @Prop({ default: undefined })
  editorConfig!: EditorConfig

  @Provide()
  contentEditor?: Vditor

  @Model('update')
  value!: string

  @Watch('disabled')
  onDisabledChange (val: boolean, oldVal: boolean) {
    if (val === oldVal) return
    if (this.contentEditor) {
      if (getBoolean(val)) {
        this.contentEditor.disabled()
      }
      else {
        this.contentEditor.enable()
      }
    }
  }

  @Emit('update')
  update (value: string) {}

  @Emit('getValue')
  getValue (value: string) {}

  @Emit('getHtml')
  getHtml (value: string) {}

  initialEditor () {
    let headers = getHeaders(this.httpOptions) as IObject
    let { emoji } = this.editorConfig ?? {}

    let options: IOptions = {
      // 编辑器总宽度，支持 %
      width: this.width,
      // 编辑器总高度
      height: this.height,
      // 编辑区域最小高度
      minHeight: this.minHeight,
      // 输入区域为空时的提示
      placeholder: this.placeholder,
      // 编辑器初始化值
      value: this.value,
      // 工具栏选项
      toolbarConfig: {
        // 固定工具栏
        pin: true
      },
      // 缓存设置
      cache: {
        // 是否使用 localStorage 进行缓存
        enable: false,
      },
      // 预览设置
      preview: {
        hljs: {
          lineNumber: true
        }
      },
    }
    // 工具栏配置
    options.toolbar = [
      'emoji', 'headings', 'bold', 'italic', 'strike', 'link', '|',
      'list', 'ordered-list', 'check', 'outdent', 'indent', '|',
      'quote', 'line', 'code', 'inline-code', 'insert-before', 'insert-after', '|',
      'upload', 'table', '|',
      'undo', 'redo', '|',
      'fullscreen', 'edit-mode',
      {
        name: 'more',
        toolbar: [
          'both', 'code-theme', 'content-theme', 'export', 'outline', 'preview', 'devtools', 'info', 'help'
        ]
      }
    ]
    // 计数器设置
    if (this.counter) {
      options.counter = this.counter
    }
    // 表情包设置
    if (emoji) {
      options.hint = {
        emoji
      }
    }
    // 上传文件配置
    if (this.upload) {
      options.upload = {
        // 上传 URL
        url: this.upload?.url,
        // 请求头设置
        headers: merge(headers, this.upload?.headers),
        // 对服务端返回的数据进行转换，以满足内置的数据结构
        format: (files: File[], responseText: string) => formatUploadFile(responseText, this.upload.format),
      }
      // 上传文件最大 Byte
      if (this.upload.max) {
        options.upload.max = this.upload.max
      }
      // 文件上传类型
      if (this.upload.accept) {
        options.upload.accept = this.upload.accept
      }
      // 上传文件是否为多个
      if (this.upload.multiple) {
        options.upload.multiple = this.upload.multiple
      }
      // 上传字段名称
      if (this.upload.fieldName) {
        options.upload.fieldName = this.upload.fieldName
      }
    }


    let contentEditor = new Vditor('vditor', {
      ...options,
      after: () => {
        
      },
      input: (value) => {
        this.update(value)
        this.getValue(contentEditor.vditor.lute.Md2HTML(value))
        this.getHtml(contentEditor.getHTML())
        
      },
      
    })
    if (getBoolean(this.disabled)) {
      contentEditor.disabled()
    }
    else {
      contentEditor.enable()
    }
    this.contentEditor = contentEditor
  }
}

function getBoolean (value: boolean) {
  return isBoolean(value) ? value : isEmpty(value)
}

function formatUploadFile (responseText: string, format: string[] = []) {
  let [ path, key, value ] =  format ?? []
  let response = JSON.parse(responseText)
  let data = get(response, path ?? 'data')
  let succMap = zipObject( map(data, key ?? 'name'), map(data, value ?? 'url') )
  let info = {
    msg: '',
    code: 0,
    data: {
      errFiles: [],
      succMap
    }
  }
  return JSON.stringify(info)
}
</script>