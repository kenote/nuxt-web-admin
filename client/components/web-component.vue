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
      :avatar-options="avatarOptions"
      @get-data="getData"
      @upload-file="uploadFile"
      @change="change"
      />
  </div>
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
  <web-container v-else-if="type === 'web-container'"
    :layout="options && options.layout">
    <template v-if="options && options.children">
      <web-component v-for="component in options.children"
        :key="component.key"
        :type="component.name"
        v-model="component.value"
        :options="merge(component.options, { 
          options: { avatar: avatarOptions },
          defaultValues: parseParams(component.options.defaultValues || '')({ auth })
        })"
        :http-options="httpOptions"
        :editor-config="editorConfig"
        @get-data="getData"
        @upload-file="uploadFile"
        @submit="submit"
        :loading="loading"
        />
    </template>
  </web-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Model, Provide, Emit, Watch } from 'nuxt-property-decorator'
// import { HttpClientOptions } from '@/utils/http-client'
import { EditorConfig, HttpClientOptions } from '@/types/client'
import { Channel, NavMenu } from '@/types/client'
import { merge } from 'lodash'
import { parseParams } from '@/utils'
import { Store } from '~/store'
import { UserDocument } from '@/types/services/db'

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

  merge = merge
  parseParams = parseParams


}
</script>