<template>
  <section class="container" >
    <codemirror 
      v-model="code" 
      :options="options"
      />
    <div class="tools">
      <el-button v-if="isCopy" size="mini" icon="el-icon-document-copy" v-clipboard="handleClipboard"></el-button>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Model, Watch, Emit } from 'nuxt-property-decorator'
import { Codemirror } from '@/utils/codemirror'
import { isEmpty, isBoolean } from 'lodash'

@Component<WebCodeMittor>({
  name: 'web-codemirror',
  mounted () {
    this.code = this.value
  }
})
export default class WebCodeMittor extends Vue {

  @Prop({ default: undefined })
  placeholder!: string

  @Prop({ default: false })
  readOnly!: boolean

  @Prop({ default: 'application/json' })
  contentType!: Codemirror.modeType

  @Prop({ default: 'default' })
  theme!: Codemirror.themeName

  @Prop({ default: false })
  lineNumbers!: boolean

  @Prop({ default: false })
  lineWrapping!: boolean

  @Prop({ default: 2 })
  tabSize!: number

  @Prop({ default: false })
  isCopy!: boolean

  @Prop({ default: undefined })
  copyright!: string

  @Prop({ default: '\n\n----------------------------\n' })
  delimiter!: string

  @Provide()
  initial: boolean = false

  @Provide()
  code: string = ''

  @Provide()
  options: Codemirror.Options = {
    tabSize: this.tabSize,
    foldGutter: true,
    styleActiveLine: true,
    lineNumbers: getBoolean(this.lineNumbers),
    lineWrapping: getBoolean(this.lineWrapping),
    styleSelectedText: false,
    line: true,
    scrollbarStyle: 'simple',
    keyMap: "sublime",
    mode: this.contentType,
    theme: this.theme,
    placeholder: this.placeholder,
    readOnly: getBoolean(this.readOnly)
  }

  @Model('update')
  value!: string

  @Watch('value')
  onValueChange (val: string, oldVal: string) {
    if (val === oldVal) return
    this.code = val
  }

  @Watch('code')
  onCodeChange (val: string, oldVal: string) {
    if (val === oldVal) return
    this.update(val)
  }

  @Watch('theme')
  onThemeChange (val: Codemirror.themeName, oldVal: Codemirror.themeName) {
    if (val === oldVal) return
    this.options.theme = val
  }

  @Watch('contentType')
  onContentTypeChange (val: Codemirror.modeType, oldVal: Codemirror.modeType) {
    if (val === oldVal) return
    this.options.mode = val
  }

  @Watch('lineNumbers')
  onLineNumbersChange (val: boolean, oldVal: boolean) {
    if (val === oldVal) return
    this.options.lineNumbers = val
  }

  @Watch('lineWrapping')
  onLineWrappingChange (val: boolean, oldVal: boolean) {
    if (val === oldVal) return
    this.options.lineWrapping = val
  }

  @Watch('disabled')
  onDisabledChange (val: boolean, oldVal: boolean) {
    if (val === oldVal) return
    this.options.readOnly = val
  }

  @Emit('update')
  update (value: string) {}

  handleClipboard () {
    let arr = [ this.code ]
    if (this.copyright) {
      arr.push(this.copyright)
    }
    return arr.join(this.delimiter)
  }
  
}

function getBoolean (value: boolean) {
  return isBoolean(value) ? value : isEmpty(value)
}
</script>

<style lang="scss">
.vue-codemirror {
  border: 1px solid #DCDFE6;
  height: inherit;

  code, pre {
    font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace !important;
  }
  
  .CodeMirror-placeholder, CodeMirror-line-like {
    color: #999 !important;
  }
  
  .CodeMirror {
    height: -webkit-fill-available;
  }

  .CodeMirror-simplescroll {
    z-index: 4;
  }
  
}
</style>