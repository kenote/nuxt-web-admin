<template>
  <section class="container" >
    <client-only placeholder="Codemirror Loading...">
      <codemirror v-model="code" :style="wrapperStyle"
        :options="options" >
      </codemirror>
    </client-only>
  </section>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop, Model, Watch } from 'nuxt-property-decorator'

@Component<DashboardCodemirror>({
  name: 'dashboard-codemirror',
  created () {
    this.options = {
      ...this.options,
      mode: this.type,
      readOnly: this.readOnly,
      theme: this.theme
    }
    this.code = this.value
  }
})
export default class DashboardCodemirror extends Vue {

  @Prop({ default: 'application/json' }) type!: string
  @Prop({ default: false }) readOnly!: boolean
  @Prop({ default: 'duotone-light' }) theme!: string
  @Prop({ default: 'height:inherit' }) wrapperStyle!: string
  
  @Provide() options: Record<string, any> = {
    tabSize: 2,
    foldGutter: true,
    styleActiveLine: true,
    lineNumbers: true,
    lineWrapping: true,
    styleSelectedText: false,
    line: true,
    scrollbarStyle: 'simple',
    keyMap: "sublime",
    mode: 'application/json',
    theme: 'duotone-light'
  }
  @Provide() code: string = ''

  @Model('update') value!: any

  @Watch('type')
  onTypeChange (val: string, oldVal: string): void {
    this.options = {
      ...this.options,
      mode: this.type
    }
  }

  @Watch('code')
  onCodeChange (val: string, oldVal: string): void {
    if (val === oldVal) return
    this.$emit('update', val)
  }

  @Watch('value')
  onValueChange (val: string, oldVal: string): void {
    this.code = val
  }
}
</script>