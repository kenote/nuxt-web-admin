<template>
  <!-- 表单单元 -->
  <web-form-item v-if="type === 'web-form-item'"
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
    :avatar-options="avatarOptions"
    @get-data="getData"
    @upload-file="uploadFile"
    @change="change"
    />
  <!-- 表单 -->
  <div v-else-if="type === 'web-form'" style="display:inline-block;width:fit-content;">
    <web-form 
      :name="options && options.name" 
      :action="options && options.action"
      :columns="options && options.columns" 
      :default-values="options && options.defaultValues"
      :rules="options && options.rules"
      :options="options && options.options"
      :loading="loading"
      :exclude="options && options.exclude"
      :submit-name="options && options.submitName"
      :submit-options="options && options.submitOptions"
      :value-format="options && options.valueFormat"
      @get-data="getData"
      @upload-file="uploadFile"
      @change="change"
      @submit="submit"
      :unique="unique"
      :times="times"
      :code-times="codeTimes"
      :verify-code-options="verifyCodeOptions"
      :env="env"
      />
  </div>
  <!-- MarkDown编辑器 -->
  <web-vditor v-else-if="type === 'web-vditor'"
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
  <!-- MarkDown文档 -->
  <web-markdown v-else-if="type === 'web-markdown'" 
    :content="options && options.content" 
    />
  <!-- HTML -->
  <web-table v-else-if="type === 'web-table'"
    :columns="options && options.columns"
    :data="options && options.data"
    />
  <!-- 视图容器 -->
  <web-container v-else-if="type === 'web-container'"
    :layout="options && options.layout"
    :width="options && options.width"
    :min-width="options && options.minWidth"
    :max-width="options && options.maxWidth"
    :height="options && options.height"
    :min-height="options && options.minHeight"
    :max-height="options && options.maxHeight"
    :margin="options && options.margin"
    :padding="options && options.padding"
    :background="options && options.background"
    :border="options && options.border"
    :justify-content="options && options.justifyContent"
    :align-items="options && options.alignItems"
    :flex="options && options.flex"
    :content="options && options.content" 
    >
    <template v-if="options && options.children">
      <template v-for="component in options.children">
        <web-component v-if="isFilter(component.conditions)"
          :key="component.key"
          :type="component.name"
          v-model="component.value"
          :options="getComponentOptions(component)"
          :http-options="httpOptions"
          :editor-config="editorConfig"
          @get-data="getData"
          @upload-file="uploadFile"
          @submit="submit"
          :unique="unique"
          :loading="loading"
          :times="times"
          :code-times="codeTimes"
          :verify-code-options="verifyCodeOptions"
          :env="env"
          />
      </template>
    </template>
  </web-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Model, Provide, Emit, Watch } from 'nuxt-property-decorator'
import { EditorConfig, HttpClientOptions } from '@/types/client'
import { Channel, NavMenu } from '@/types/client'
import { merge, isString, isPlainObject } from 'lodash'
import { parseParams, isYaml } from '@/utils'
import { Store } from '~/store'
import { UserDocument } from '@/types/services/db'
import ruleJudgment from 'rule-judgment'
import { FilterQuery } from '@kenote/common'
import nunjucks from 'nunjucks'
import jsYaml from 'js-yaml'

@Component<WebComponent>({
  name: 'web-component',
  created () {
    this.values = this.value
  }
})
export default class WebComponent extends Vue {

  @Store.Setting.Getter
  avatarOptions!: NavMenu.AvatarOptions

  @Store.Auth.State 
  auth!: UserDocument | null
  
  @Prop({ default: undefined })
  type!: string
  
  @Prop({ default: false })
  loading!: true

  @Prop({ default: undefined })
  options!: Record<string, any>

  @Prop({ default: undefined })
  httpOptions!: HttpClientOptions

  @Prop({ default: undefined })
  editorConfig!: EditorConfig

  @Prop({ default: undefined })
  defaultValues!: Record<string, any>

  @Prop({ default: undefined })
  unique!: (name: string, path: string | null, type: string) => Promise<any>

  @Prop({ default: 0 })
  times!: number

  @Prop({ default: 0 })
  codeTimes!: number

  @Prop({ default: undefined })
  verifyCodeOptions!: Channel.verifyCodeOptions

  @Prop({ default: undefined })
  env!: Record<string, any>

  @Model('update')
  value!: any

  @Emit('update')
  update (value: any) {}

  @Emit('submit')
  submit (values: Record<string, any>, action: Channel.RequestConfig, options: Channel.SubmitOptions) {}

  @Emit('get-data')
  getData (options: Channel.RequestConfig, next: (data: { key: number | string, name: string }[]) => void) {}

  @Emit('upload-file')
  uploadFile (file: File, options: any, next: (doc: any, err?: Error) => void) {}

  @Emit('change')
  change (values: Record<string, any>) {}

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

  @Watch('options')
  onOptionsChange (val: any, oldVal: any) {
    console.log('options', val)
  }

  merge = merge
  parseParams = parseParams

  isFilter (conditions: FilterQuery<any> | string) {
    if (!conditions) return true
    let query = conditions
    if (isString(conditions) && isYaml(conditions)) {
      query = jsYaml.safeLoad(nunjucks.renderString(conditions, this.env)) as FilterQuery<any>
      if (!isPlainObject(query)) return true
    } 
    let filter = ruleJudgment(query as FilterQuery<any>)
    return filter(this.env)
  }

  getComponentOptions (component: Channel.Component) {
    return merge(component.options, { 
      options: { avatar: this.avatarOptions },
      defaultValues: parseParams(component.options.defaultValues || '')(this.env)
    })
  }

}
</script>