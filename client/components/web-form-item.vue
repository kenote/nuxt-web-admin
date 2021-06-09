<template>
  <!-- 单选框 -->
  <el-radio-group v-if="/^(radio)/.test(type)" v-model="values" :disabled="disabled">
    <template v-if="/(button)$/.test(type)">
      <el-radio-button v-for="(item, key) in propData.map(parseProps(props))" 
        :key="key" 
        :label="item.key" 
        :disabled="item.disabled">
        {{ toFormatString(item, format || '{name}') }}
      </el-radio-button>
    </template>
    <template v-else>
      <el-radio v-for="(item, key) in propData.map(parseProps(props))" 
        :key="key" 
        :label="item.key" 
        :disabled="item.disabled" 
        :border="border">
        {{ toFormatString(item, format || '{name}') }}
      </el-radio>
    </template>
  </el-radio-group>
  <!-- 多选框 -->
  <el-checkbox-group v-else-if="/^(checkbox)/.test(type)" v-model="values" :disabled="disabled">
    <template v-if="/(button)$/.test(type)">
      <el-checkbox-button v-for="(item, key) in propData.map(parseProps(props))" 
        :key="key" 
        :label="item.key" 
        :disabled="item.disabled">
        {{ toFormatString(item, format || '{name}') }}
      </el-checkbox-button>
    </template>
    <template v-else>
      <el-checkbox v-for="(item, key) in propData.map(parseProps(props))" 
        :key="key" 
        :label="item.key" 
        :disabled="item.disabled" 
        :border="border">
        {{ toFormatString(item, format || '{name}') }}
      </el-checkbox>
    </template>
  </el-checkbox-group>
  <!-- 下拉选择器 -->
  <el-select v-else-if="type === 'select'"
    v-model="values"
    :placeholder="placeholder"
    :disabled="disabled"
    :style="{ width: `300px`, ...styles }" 
    :multiple="multiple"
    :clearable="options && options.clearable"
    collapse-tags
    filterable >
    <template v-if="propData">
      <el-option v-for="(item, key) in propData.map(parseProps(props))" 
        :key="key" 
        :label="toFormatString(item, format || '{name}')" 
        :value="item.key" 
        :disabled="item.disabled">
      </el-option>
    </template>
  </el-select>
  <!-- 群组选择器 -->
  <group-picker v-else-if="type === 'group-picker'"
    v-model="values"
    :data="propData"
    :props="props"
    :multiple="multiple"
    :format="format"
    :width="width"
    :span="options && options.span"
    :title="options && options.title"
    :disabled="disabled"
    />
  <!-- 头像选择器 -->
  <avatar-picker v-else-if="type === 'avatar-picker'"
    v-model="values"
    :quality="options && options.quality"
    :file-type="options && options.fileType"
    :filename="options && options.filename"
    :is-upload="options && options.isUpload"
    :options="avatarOptions"
    @upload-file="uploadFile"
    :width="width"
    :height="height"
    />
  <!-- 单日期选择 -->
  <el-date-picker v-else-if="['year', 'month', 'date', 'dates', 'week', 'datetime'].includes(type)" 
    v-model="values"
    :type="type"
    :format="format"
    :value-format="valueFormat"
    :placeholder="placeholder"
    :disabled="disabled"
    :align="options && options.align"
    :clearable="options && options.clearable"
    :editable="options && options.editable"
    :readonly="options && options.readonly"
    :picker-options="props"
    :style="{ ...styles }" 
    />
  <!-- 日期范围选择 -->
  <el-date-picker v-else-if="['datetimerange', 'daterange', 'monthrange'].includes(type)" 
    v-model="values"
    :type="type"
    :format="format"
    :value-format="valueFormat"
    :default-time="options && options.defaultTime"
    :start-placeholder="placeholder && placeholder[0]"
    :end-placeholder="placeholder && placeholder[1]"
    :disabled="disabled"
    :align="options && options.align"
    :clearable="options && options.clearable"
    :editable="options && options.editable"
    :readonly="options && options.readonly"
    :range-separator="options && options.rangeSeparator"
    :picker-options="props"
    :style="{ ...styles }" 
    />
  <!-- 单时间选择 -->
  <el-time-picker v-else-if="type === 'time'"
    v-model="values"
    :arrow-control="options && options.arrowControl"
    :value-format="valueFormat || 'HH:mm:ss'"
    :placeholder="placeholder"
    :disabled="disabled"
    :align="options && options.align"
    :clearable="options && options.clearable"
    :editable="options && options.editable"
    :readonly="options && options.readonly"
    :picker-options="props"
    :style="{ ...styles }" 
    />
  <!-- 单时间选择 -->
  <el-time-picker v-else-if="type === 'timerange'"
    v-model="values"
    is-range
    :arrow-control="options && options.arrowControl"
    :value-format="valueFormat || 'HH:mm:ss'"
    :start-placeholder="placeholder && placeholder[0]"
    :end-placeholder="placeholder && placeholder[1]"
    :picker-options="props"
    :disabled="disabled"
    :align="options && options.align"
    :clearable="options && options.clearable"
    :editable="options && options.editable"
    :readonly="options && options.readonly"
    :style="{ ...styles }" 
    />
  <!-- 开关 -->
  <el-switch v-else-if="type === 'switch'"
    v-model="values"
    :active-text="options && options.activeText"
    :inactive-text="options && options.inactiveText"
    :active-color="options && options.activeColor"
    :inactive-color="options && options.inactiveColor"
    :active-value="options && options.activeValue"
    :inactive-value="options && options.inactiveValue"
    :active-icon-class="options && options.activeIconClass"
    :inactive-icon-class="options && options.inactiveIconClass"
    :disabled="disabled"
    />
  <!-- 滑块 -->
  <el-slider v-else-if="type === 'slider'"
    v-model="values"
    :min="min"
    :max="max"
    :step="step"
    :range="multiple"
    :marks="props"
    :show-stops="options && options.showStops"
    :show-tooltip="options && options.showTooltip"
    :vertical="options && options.vertical"
    :disabled="disabled"
    />
  <!-- 颜色选择器 -->
  <el-color-picker v-else-if="type === 'color-picker'"
    v-model="values"
    :color-format="format"
    :predefine="options && options.predefine"
    :disabled="disabled"
    :show-alpha="options && options.showAlpha"
    />
  <!-- 级联选择器 -->
  <el-cascader v-else-if="type === 'cascader'"
    v-model="values"
    :options="propData"
    :props="{ ...props, multiple }"
    collapse-tags
    filterable
    :filter-method="filterMethod"
    :placeholder="placeholder"
    :disabled="disabled"
    :style="{ display: 'inline-flex', width: `300px`, ...styles }" 
    />
  <!-- 级联面板 -->
  <el-cascader-panel v-else-if="type === 'cascader-panel'"
    v-model="values"
    :options="propData"
    :props="{ ...props, multiple }"
    collapse-tags
    filterable
    :filter-method="filterMethod"
    :placeholder="placeholder"
    :disabled="disabled"
    :style="{ display: 'inline-flex', ...styles }" 
    />
  <!-- 评分 -->
  <el-rate v-else-if="type === 'rate'"
    v-model="values"
    :max="max"
    :colors="options && options.colors"
    :show-text="options && options.showText"
    :texts="options && options.texts"
    :text-color="options && options.textColor"
    :show-score="options && options.showScore"
    :allow-half="options && options.allowHalf"
    :score-template="options && options.scoreTemplate"
    :low-threshold="options && options.lowThreshold"
    :high-threshold="options && options.highThreshold"
    :disabled="disabled"
    />
  <!-- 穿梭框 -->
  <el-transfer v-else-if="type === 'transfer'"
    v-model="values"
    :data="propData"
    :props="props"
    :filterable="options && options.filterable"
    :filter-placeholder="options && options.filterPlaceholder"
    :titles="options && options.titles"
    :button-texts="options && options.buttonTexts"
    :target-order="options && options.targetOrder"
    :left-default-checked="options && options.leftDefaultChecked"
    :right-default-checked="options && options.rightDefaultChecked"
    :filter-method="filterMethod"
    >
    <span slot-scope="{ option }">{{ toFormatString(option, format) }}</span>
  </el-transfer>
  <!-- CodeMirror -->
  <web-codemirror v-else-if="type === 'codemirror'"
    v-model="values" 
    :theme="options && options.theme"
    :content-type="options && options.contentType"
    :placeholder="placeholder"
    :read-only="options && options.readOnly"
    :line-numbers="options && options.lineNumbers"
    :line-wrapping="options && options.lineWrapping"
    :tab-size="options && options.tabSize"
    :is-copy="options && options.isCopy"
    :copyright="options && options.copyright"
    :delimiter="options && options.delimiter"
    :style="{ width: `450px`, height: `300px`, ...styles }"
    />
  <!-- 验证码 -->
  <verify-code v-else-if="type === 'verify-code'"
    v-model="values"
    :placeholder="placeholder"
    :disabled="disabled"
    :times="codeTimes"
    :is-send-code="isSendCode"
    @send-code="sendCode"
    />
  <!-- 数字输入框 -->
  <el-input-number v-else-if="type === 'input-number'"
    v-model="values"
    :min="min"
    :max="max"
    :step="step"
    :precision="options && options.precision"
    :step-strictly="options && options.stepStrictly"
    :controls-position="options && options.controlsPosition"
    :placeholder="placeholder"
    :disabled="disabled"
    />
  <!-- 多行文本框 -->
  <el-input v-else-if="type === 'textarea'"
    type="textarea"
    v-model="values"
    :placeholder="placeholder"
    :disabled="disabled"
    :minlength="min"
    :maxlength="max"
    :resize="options && options.resize"
    :rows="options && options.rows"
    :autosize="options && options.autosize"
    :show-word-limit="options && options.showWordLimit"
    :clearable="options && options.clearable"
    :style="{ width: `450px`, ...styles }"
    />
  <!-- 密码输入框 -->
  <el-input v-else-if="type === 'input-password'"
    v-model="values" 
    type="password"
    :placeholder="placeholder" 
    :disabled="disabled"
    :show-password="options && options.showPassword"
    :clearable="options && options.clearable"
    :style="{ width: `300px`, ...styles }" 
    />
  <!-- 单行输入框 -->
  <el-input v-else-if="type === 'input'" 
    v-model="values" 
    :placeholder="placeholder" 
    :disabled="disabled" 
    :minlength="min"
    :maxlength="max"
    :show-word-limit="options && options.showWordLimit"
    :clearable="options && options.clearable"
    :style="{ width: `300px`, ...styles }" 
    />
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Model, Watch, Emit } from 'nuxt-property-decorator'
import { Channel } from '@/types/client'
import { parseProps, parseDate } from '@/utils'
import { template, unset, isString, isFunction, isArray } from 'lodash'
import jsYaml from 'js-yaml'

@Component<WebFormItem>({
  name: 'web-form-item',
  created () {
    this.propData = this.data ?? []
    if (this.request) {
      this.getData(this.request, data => {
        this.propData = data ?? []
      })
    }
    this.values = this.value
    if (this.width) {
      let _val = ['input'].includes(this.type) && this.width === 'auto' ? '100%' : this.width
      this.styles = { width: this.width === 'auto' ? _val : `${this.width}px` }
    }
    if (this.height) {
      this.styles = { ...this.styles, height: `${this.height}px` }
    }
    if (this.options?.filterMethod) {
      if (isString(this.options.filterMethod)) {
        try {
          this.filterMethod = jsYaml.load(this.options.filterMethod) ?? null
        } catch (error) {
          
        }
      }
      else if (isFunction(this.options.filterMethod)) {
        this.filterMethod = this.options.filterMethod
      }
    }
    if (isArray(this.props?.shortcuts)) {
      this.props.shortcuts = this.props?.shortcuts.map( shortcut => {
        let value = isArray(shortcut.value) ? shortcut.value.map(parseDate) : parseDate(shortcut.value)
        return {
          text: shortcut.label,
          onClick (picker: Vue) {
            picker.$emit('pick', value)
          }
        }
      })
    }
  }
})
export default class WebFormItem extends Vue {

  @Prop({ default: 'input' })
  type!: Channel.FormItemType

  @Prop({ default: undefined })
  data!: Channel.FormItemData[]

  @Prop({ default: undefined })
  request!: Channel.RequestConfig

  @Prop({ default: undefined })
  placeholder!: string | string[]

  @Prop({ default: false })
  disabled!: boolean

  @Prop({ default: undefined })
  width!: number | 'auto'

  @Prop({ default: undefined })
  height!: number

  @Prop({ default: false })
  border!: boolean

  @Prop({ default: false })
  multiple!: boolean

  @Prop({ default: undefined })
  min!: number

  @Prop({ default: undefined })
  max!: number

  @Prop({ default: undefined })
  step!: number

  @Prop({ default: undefined })
  format!: string

  @Prop({ default: undefined })
  valueFormat!: string

  @Prop({ default: undefined })
  props!: Record<string, any>

  @Prop({ default: undefined })
  options!: Record<string, any>

  @Prop({ default: undefined })
  avatarOptions!: Record<string, any>

  @Prop({ default: 0 })
  codeTimes!: number

  @Prop({ default: false })
  isSendCode!: boolean

  @Provide()
  styles: Record<string, any> = {}

  @Provide()
  propData: Channel.FormItemData[] = []

  @Provide()
  filterMethod: Function | null = null

  @Provide()
  values: any = ''

  @Model('update')
  value!: any

  @Emit('update')
  update (value: any) {}

  @Emit('get-data')
  getData (options: Channel.RequestConfig, next: (data: { key: number | string, name: string }[]) => void) {}

  @Emit('upload-file')
  uploadFile (file: File | File[] | string, options: any, next: (doc: any, err?: Error) => void) {}

  @Emit('send-code')
  sendCode (data: any) {}

  @Emit('change')
  change (value: any) {}

  @Watch('values')
  onValuesChange (val: any, oldVal: any) {
    if (val === oldVal) return
    this.update(val)
    this.change(val)
  }

  @Watch('value')
  onValueChange (val: any, oldVal: any) {
    if (val === oldVal) return
    this.values = val
  }

  @Watch('width')
  onWidthChange (val: number | 'auto', oldVal: number | 'auto') {
    if (val === oldVal) return
    if (val) {
      let _val = ['input'].includes(this.type) && val === 'auto' ? '100%' : val
      this.styles = { ...this.styles, width: val === 'auto' ? _val : `${val}px` }
    }
    else {
      unset(this.styles, 'width')
    }
  }

  @Watch('height')
  onHeightChange (val: number, oldVal: number) {
    if (val === oldVal) return
    if (val) {
      this.styles = { ...this.styles, height: `${val}px` }
    }
    else {
      unset(this.styles, 'height')
    }
  }

  parseProps = parseProps
  console = console

  toFormatString (data: Record<string, any>, format: string = '{label}') {
    if (this.props) {
      let { key, label } = this.props
      if (key) {
        format = format.replace(/{key}/g, `{${key}}`)
      }
      if (label) {
        format = format.replace(/{label}/g, `{${label}}`)
      }
    }
    return template(format, { interpolate: /{([\s\S]+?)}/g })(data)
  }
  
}
</script>