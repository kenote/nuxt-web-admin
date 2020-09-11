<template>
  <div>
    <div class="form-container">
      <h2>{{ title }}</h2>
      <dashboard-codemirror v-model="code" theme="duotone-light" type="text/x-yaml" wrapperStyle="height:500px" />
    </div>
    <!-- 底部操作区 -->
    <dashboard-footer-bar v-if="showFooter" :visible="showFooter">
      <el-button type="primary" style="margin-left:15px" @click="handleSubmit" :loading="loading" >提交</el-button>
      <el-button type="success" style="margin-left:15px" @click="$emit('goback', null)">返回</el-button>
    </dashboard-footer-bar>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop, Model } from 'nuxt-property-decorator'
import { cloneDeep } from 'lodash'

@Component<DashboardCodeEditor>({
  name: 'dashboard-code-editor',
  created () {
    this.showFooter = true
    this.code = cloneDeep(this.content)
  }
})
export default class DashboardCodeEditor extends Vue {
  
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: '' }) title!: string
  @Prop({ default: '' }) content!: string
  
  @Provide() showFooter: boolean = false
  @Provide() code: string = ''

  handleSubmit (): void {
    this.$emit('submit', this.code)
  }
}
</script>