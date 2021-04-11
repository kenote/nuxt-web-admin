<template>
  <!-- 单选框 -->
  <el-radio-group v-if="/^(radio)/.test(type)" v-model="values" :disabled="disabled">
    <template v-if="/(button)$/.test(type)">
      <el-radio-button v-for="(item, key) in propData.map(parseProps(props))" :key="key" :label="item.key">{{ item.name }}</el-radio-button>
    </template>
    <template v-else>
      <el-radio v-for="(item, key) in propData.map(parseProps(props))" :key="key" :label="item.key" :border="border">{{ item.name }}</el-radio>
    </template>
  </el-radio-group>
  <!-- 多选框 -->
  <el-checkbox-group v-else-if="/^(checkbox)/.test(type)" v-model="values" :disabled="disabled">
    <template v-if="/(button)$/.test(type)">
      <el-checkbox-button v-for="(item, key) in propData.map(parseProps(props))" :key="key" :label="item.key">{{ item.name }}</el-checkbox-button>
    </template>
    <template v-else>
      <el-checkbox v-for="(item, key) in propData.map(parseProps(props))" :key="key" :label="item.key" :border="border">{{ item.name }}</el-checkbox>
    </template>
  </el-checkbox-group>
  <!-- 下拉选择器 -->
  <el-select v-else-if="type === 'select'"
    v-model="values"
    :placeholder="placeholder"
    :disabled="disabled"
    :style="{ width: `300px`, ...styles }" 
    :multiple="multiple"
    :filter-method="filterMethod"
    collapse-tags
    filterable >
    <template v-if="propData">
      <el-option v-for="(item, key) in propData.map(parseProps(props))" :key="key" :label="toFormatString(item, format || '{name}')" :value="item.key"></el-option>
    </template>
  </el-select>
  <!-- 单日期选择 -->
  <el-date-picker v-else-if="['year', 'month', 'date', 'dates', 'week', 'datetime'].includes(type)" 
    v-model="values"
    :type="type"
    :format="format"
    :value-format="valueFormat"
    :placeholder="placeholder"
    :disabled="disabled"
    :picker-options="options"
    :style="{ ...styles }" 
    />
  <!-- 日期范围选择 -->
  <el-date-picker v-else-if="['datetimerange', 'daterange', 'monthrange'].includes(type)" 
    v-model="values"
    :type="type"
    :format="format"
    :value-format="valueFormat"
    :default-time="defaultTime"
    :start-placeholder="placeholder && placeholder[0]"
    :end-placeholder="placeholder && placeholder[1]"
    :disabled="disabled"
    :picker-options="options"
    :style="{ ...styles }" 
    />
  <!-- 单时间选择 -->
  <el-time-picker v-else-if="type === 'time'"
    v-model="values"
    arrow-control
    :value-format="valueFormat || 'HH:mm:ss'"
    :placeholder="placeholder"
    :disabled="disabled"
    :picker-options="options"
    :style="{ ...styles }" 
    />
  <!-- 单时间选择 -->
  <el-time-picker v-else-if="type === 'timerange'"
    v-model="values"
    is-range
    arrow-control
    :value-format="valueFormat || 'HH:mm:ss'"
    :start-placeholder="placeholder && placeholder[0]"
    :end-placeholder="placeholder && placeholder[1]"
    :picker-options="options"
    :disabled="disabled"
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
    :marks="options"
    :disabled="disabled"
    />
  <!-- 颜色选择器 -->
  <el-color-picker v-else-if="type === 'color-picker'"
    v-model="values"
    :color-format="format"
    :predefine="options && options.predefine"
    :disabled="disabled"
    show-alpha
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
    :style="{ display: 'inline-flex', ...styles }" 
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
    :disabled="disabled"
    />
  <!-- 穿梭框 -->
  <el-transfer v-else-if="type === 'transfer'"
    v-model="values"
    :data="propData"
    :props="props"
    filterable
    :filter-placeholder="placeholder"
    :titles="options && options.titles"
    :button-texts="options && options.buttonTexts"
    :target-order="options && options.targetOrder"
    :filter-method="filterMethod"
    >
    <span slot-scope="{ option }">{{ toFormatString(option, format) }}</span>
  </el-transfer>
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
    resize="none"
    :autosize="{ minRows: min || 4, maxRows: max || 4 }"
    :style="{ width: `450px`, ...styles }"
    />
  <!-- 单行输入框 -->
  <el-input v-else-if="type === 'input'" 
    v-model="values" 
    :placeholder="placeholder" 
    :disabled="disabled" 
    :style="{ width: `300px`, ...styles }" 
    />
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Model, Watch, Emit } from 'nuxt-property-decorator'
import { Channel } from '@/types/client'
import { parseProps } from '@/utils'
import { template } from 'lodash'
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
      this.styles = { width: `${this.width}px`}
    }
    if (this.options?.filterMethod) {
      this.filterMethod = jsYaml.load(this.options.filterMethod) ?? null
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
  width!: number

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
  defaultTime!: string[]

  @Prop({ default: undefined })
  props!: Record<string, string>

  @Prop({ default: undefined })
  options!: Record<string, any>

  @Provide()
  styles: Record<string, any> = {}

  @Provide()
  propData: Channel.FormItemData[] = []

  @Provide()
  filterMethod: Function | null = null

  @Provide()
  values: any = ''

  @Model('update')
  value!: string

  @Emit('update')
  update (value: any) {}

  @Emit('get-data')
  getData (options: Channel.RequestConfig, next: (data: { key: number | string, name: string }[]) => void) {}

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

  parseProps = parseProps

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