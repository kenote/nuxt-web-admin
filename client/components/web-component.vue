<template>
  <div v-if="type === 'web-form-item'">
    <web-form-item
      v-model="values"
      :type="options && options.type"
      :data="options && options.data"
      :props="options && options.props"
      :placeholder="options && options.placeholder" 
      :width="options && options.width"
      :height="options && options.height"
      :border="options && options.border"
      :min="options && options.min"
      :max="options && options.max"
      :step="options && options.step"
      :format="options && options.format"
      :value-format="options && options.valueFormat"
      :default-time="options && options.defaultTime"
      :options="options && options.options"
      :multiple="options && options.multiple"
      :disabled="options && options.disabled"
      :request="options && options.request"
      />
  </div>
  <div v-else-if="type === 'web-vditor'">
    <web-vditor
      v-model="values"
      :placeholder="options && options.placeholder" 
      :width="options && options.width" 
      :min-height="options && options.minHeight" 
      :height="options && options.height" 
      :upload="options && options.upload"
      :counter="options && options.counter"
      :disabled="options && options.disabled"
      :http-options="httpOptions"
      :editor-config="editorConfig"
      />
  </div>
  <fragment v-else-if="type === 'web-markdown'">
    <web-markdown :content="options && options.content" />
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Prop, Model, Provide, Emit, Watch } from 'nuxt-property-decorator'
import { HttpClientOptions } from '@/utils/http-client'
import { EditorConfig } from '@/types/client'

@Component<WebComponent>({
  name: 'web-component',
  created () {
    this.values = this.value
  }
})
export default class WebComponent extends Vue {
  
  @Prop({ default: undefined })
  type!: string

  @Prop({ default: undefined })
  options!: Record<string, any>

  @Prop({ default: undefined })
  httpOptions!: HttpClientOptions

  @Prop({ default: undefined })
  editorConfig!: EditorConfig

  @Model('update')
  value!: any

  @Emit('update')
  update (value: any) {}

  @Provide()
  values: any = ''

  @Watch('values')
  onValuesChange (val: any, oldVal: any) {
    if (val === oldVal) return
    this.update(val)
  }

  @Watch('value')
  onValueChange (val: any, oldVal: any) {
    if (val === oldVal) return
    this.values = val
  }


}
</script>