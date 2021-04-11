<template>
  <div class="form-container">
    <h2>{{ name }}</h2>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="handleSubmit" label-width="150px">
      <template v-if="columns">
        <el-form-item v-for="(item, key) in columns" :key="key" :prop="item.key" :label="item.name" :rules="rules[item.key]" :style="item.type === 'color-picker' ? 'height:40px;' : ''">
          <web-form-item 
            v-model="values[item.key]"
            :type="item.type"
            :data="item.data"
            :props="item.props"
            :placeholder="item.placeholder" 
            :width="item.width"
            :border="item.border"
            :min="item.min"
            :max="item.max"
            :step="item.step"
            :format="item.format"
            :value-format="item.valueFormat"
            :default-time="item.defaultTime"
            :options="item.options"
            :multiple="item.multiple"
            :disabled="item.disabled"
            :request="item.request"
            @get-data="getData"
            />
        </el-form-item>
      </template>
      <el-form-item>
        <el-button type="primary" native-type="submit">{{ submitName }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Emit, Watch } from 'nuxt-property-decorator'
import { cloneDeep } from 'lodash'
import { Verify, Channel } from '@/types/client'
import { Form as ElForm } from 'element-ui'

@Component<WebForm>({
  name: 'web-form',
  created () {
    this.values = cloneDeep(this.defaultValues ?? {})
  }
})
export default class WebForm extends Vue {

  @Prop({ default: '' })
  name!: string

  @Prop({ default: undefined })
  columns!: Channel.FormItem[]

  @Prop({ default: undefined })
  rules!: Record<string, Array<Verify.Rule>>

  @Prop({ default: undefined })
  defaultValues!: Record<string, any>

  @Prop({ default: '提 交' })
  submitName!: string

  @Provide()
  values: Record<string, any> = {}

  @Emit('submit')
  submit (values: Record<string, any>) {}

  @Emit('get-data')
  getData (options: Channel.RequestConfig, next: (data: { key: number | string, name: string }[]) => void) {}

  handleSubmit () {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate(valid => {
      if (valid) {
        console.log('submit', this.values)
      }
      else {
        return false
      }
    })
  }
  
}
</script>