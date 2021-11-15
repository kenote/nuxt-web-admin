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
    :size="options && options.size"
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
  <div v-else-if="type === 'web-form'" style="display:inline-block;width:100%;">
    <web-form 
      :name="options && options.name" 
      :inline="options && options.inline"
      :display="options && options.display"
      :action="options && options.action"
      :columns="options && options.columns" 
      :default-values="options && options.defaultValues"
      :rules="options && options.rules"
      :options="options && options.options"
      :loading="loading"
      :exclude="options && options.exclude"
      :merge="options && options.merge"
      :submit-name="options && options.submitName"
      :submit-options="options && options.submitOptions"
      :value-format="options && options.valueFormat"
      @get-data="getData"
      @upload-file="uploadFile"
      @change="change"
      @submit="submit"
      @command="command"
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
    />
  <!-- MarkDown文档 -->
  <web-markdown v-else-if="type === 'web-markdown'" 
    :content="options && options.content" 
    :outline="options && options.outline"
    :disabled-click="options && options.disabledClick"
    />
  <!-- 详情 -->
  <web-detail v-else-if="type === 'web-detail'"
    :request="options && options.request"
    :type="options && options.type"
    :props="options && options.props"
    :date-format="options && options.dateFormat"
    :after-command="options && options.afterCommand"
    @get-data="getData"
    @command="command"
    :env="env"
    />
  <!-- 表格 -->
  <web-table v-else-if="type === 'web-table'"
    :columns="options && options.columns"
    :selection-open="options && options.selection"
    :selection-disabled="options && options.selectionDisabled"
    :sorter="options && options.sorter"
    :expand="options && options.expand"
    :data="data || (options && options.data)"
    :request="options && options.request"
    :border="options && options.border"
    :loading="loading"
    :pageno="pageno"
    :counts="counts"
    :pagination="pagination"
    @get-data="getData"
    @command="command"
    @to-page="toPage"
    @selection-change="selectionChange"
    @submit="submit"
    :env="env"
    />
  <!-- 成员管理器 -->
  <web-people v-else-if="type === 'web-people'"
    :title="options && options.title"
    :columns="options && options.columns"
    :request="options && options.request"
    :invite="options && options.invite"
    :add-request="options && options.add"
    :remove-request="options && options.remove"
    :owner-request="options && options.owner"
    :close-after="options && options.closeAfter"
    :env="env"
    @command="command"
    @get-data="getData"
    @submit="submit"
    />
  <!-- 预览视图 -->
  <web-preview v-else-if="type === 'web-preview'"
    :title="options && options.title"
    :content="options && options.content"
    :mode="options && options.mode"
    :max-width="options && options.maxWidth"
    :request="options && options.request"
    :close-after="options && options.closeAfter"
    :env="env"
    @get-data="getData"
    @submit="submit"
    />
  <!-- 按钮 -->
  <el-button v-else-if="type === 'web-button'"
    :size="options && options.size"
    :type="options && options.type"
    :plain="options && options.plain"
    :round="options && options.round"
    :circle="options && options.circle"
    :disabled="options && options.disabled"
    :icon="options && options.icon"
    @click="command(options && options.command, {})"
    >
    {{ options && options.name }}
  </el-button>
  <!-- 对话框 -->
  <web-dialog v-else-if="type === 'web-dialog'"
    :title="options && options.title"
    :env="env"
    @close="command('dialog:none')"
    @submit="handleSubmit(options.key)"
    :loading="loading"
    >
    <template v-if="options && options.content">
      <web-form v-if="options.content.type === 'web-form'"
        :ref="options.key"
        :name="options.content && options.content.name" 
        :action="options.content && options.content.action"
        :columns="options.content && options.content.columns" 
        :default-values="options.content && options.content.defaultValues"
        :rules="options.content && options.content.rules"
        :options="options.content && options.content.options"
        :loading="loading"
        :exclude="options.content && options.content.exclude"
        :submit-name="options.content && options.content.submitName"
        :submit-options="options.content && options.content.submitOptions"
        :value-format="options.content && options.content.valueFormat"
        @get-data="getData"
        @upload-file="uploadFile"
        @change="handleChange"
        @submit="submit"
        @command="command"
        :unique="unique"
        :times="times"
        :code-times="codeTimes"
        :verify-code-options="verifyCodeOptions"
        :env="env"
        :is-change="true"
        />
      <datanode-select v-else-if="options.content.type === 'datanode-select'"
        :ref="options.key"
        :default-values="options.content && options.content.defaultValues"
        :data="options.content && options.content.data"
        :props="options.content && options.content.props"
        :request="options.content && options.content.request"
        :node-key="options.content && options.content.nodeKey"
        :action="options.content && options.content.action"
        :post-key="options.content && options.content.postKey"
        :submit-options="options.content && options.content.submitOptions"
        @get-data="getData"
        @submit="submit"
        :env="env"
        :loading="loading"
        />
    </template>
  </web-dialog>
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
          @get-data="getData"
          @upload-file="uploadFile"
          @submit="submit"
          @command="command"
          @to-page="toPage"
          @selection-change="selectionChange"
          :unique="unique"
          :loading="loading"
          :data="data"
          :pageno="pageno"
          :counts="counts"
          :pagination="pagination"
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
import { Component, Prop, Model, Provide, Emit, Watch, mixins } from 'nuxt-property-decorator'
import { Channel, NavMenu } from '@/types/client'
import { merge, get } from 'lodash'
import { Store } from '~/store'
import { UserDocument } from '@/types/services/db'
import EnvironmentMixin from '~/mixins/environment'

@Component<WebComponent>({
  name: 'web-component',
  created () {
    this.values = this.value
  }
})
export default class WebComponent extends mixins(EnvironmentMixin) {

  @Store.Setting.Getter
  avatarOptions!: NavMenu.AvatarOptions

  @Store.Auth.State 
  auth!: UserDocument | null
  
  @Prop({ default: undefined })
  type!: string
  
  @Prop({ default: undefined })
  name!: string
  
  @Prop({ default: false })
  loading!: true

  @Prop({ default: undefined })
  data!: Record<string, any>[] | null

  @Prop({ default: 1 })
  pageno!: number

  @Prop({ default: -1 })
  counts!: number

  @Prop({ default: false })
  pagination!: number | false

  @Prop({ default: undefined })
  options!: Record<string, any>

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

  @Model('update')
  value!: any

  @Emit('update')
  update (value: any) {}

  @Emit('submit')
  submit (values: Record<string, any>, action: Channel.RequestConfig, options: Channel.SubmitOptions) {}

  @Emit('get-data')
  getData (request: Channel.RequestConfig, options: Record<string,any> | null, next: (data: { key: number | string, name: string }[]) => void) {}

  @Emit('upload-file')
  uploadFile (file: File, options: any, next: (doc: any, err?: Error) => void) {}

  @Emit('change')
  change (values: Record<string, any>) {}

  @Emit('command')
  command (type: string, row?: Record<string, any>, component?: Vue) {}

  @Emit('to-page')
  toPage (page: number) {}

  @Emit('selection-change')
  selectionChange (values: Record<string, any>[]) {}

  @Emit('close')
  close () {}

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

  getComponentOptions (component: Channel.Component) {
    return merge(component.options, { 
      options: { avatar: this.avatarOptions },
      // defaultValues: parseParams(component.options.defaultValues || '')(this.env)
    })
  }

  handleChange (value: any) {
    this.values = value
  }

  handleSubmit (key: string) {
    let theForm = this.$refs[key]
    if (get(theForm, 'handleSubmit')) {
      get(theForm, 'handleSubmit')()
    }
  }

}
</script>