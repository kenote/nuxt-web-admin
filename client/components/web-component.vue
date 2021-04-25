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
</template>

<script lang="ts">
import { Component, Vue, Prop, Model, Provide, Emit, Watch } from 'nuxt-property-decorator'

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