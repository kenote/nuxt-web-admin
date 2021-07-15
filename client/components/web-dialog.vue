<template>
  <el-dialog 
      :title="title" 
      :width="width" 
      :fullscreen="fullscreen" 
      :visible="visible" 
      :append-to-body="true"
      @close="handleClose">
      <div slot="title" class="el-dialog__header_left">
        <span class="el-dialog__title">{{ title }}</span>
        <el-button :icon="fullscreen ? 'el-icon-copy-document' : 'el-icon-full-screen'" style="float:right" @click="fullscreen = !fullscreen"></el-button>
      </div>
      <section :style="bodyStyles" ref="theInput">
        <slot></slot>
      </section>
      <span slot="footer" class="dialog-footer">
        <div class="dialog-footer-left">
          <slot name="tools"></slot>
        </div>
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit" v-loading="loading">确 定</el-button>
      </span>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Emit, Model, mixins, Watch } from 'nuxt-property-decorator'
import EnvironmentMixin from '~/mixins/environment'

@Component<WebDialog>({
  name: 'web-dialog',
  created () {
    
  }
})
export default class WebDialog extends Vue {

  @Prop({ default: false })
  loading!: boolean

  @Prop({ default: undefined })
  env!: Record<string, any>

  @Prop({ default: '' })
  title!: string

  @Prop({ default: '960px' })
  width!: string

  @Provide()
  fullscreen: boolean = false

  @Provide()
  bodyStyles: Record<string, any> = { height: '500px' }

  @Provide()
  visible: boolean = true

  @Model('update')
  value!: any

  @Emit('update')
  update (value: any) {}

  @Watch('fullscreen')
  onFullscreenChange (val: boolean, oldVal: boolean) {
     if (val === oldVal) return
     if (val) {
       this.bodyStyles = { height: 'calc(100vh - 185px)', overflow: 'hidden' }
     }
     else {
       this.bodyStyles = { height: '500px' }
     }
  }

  handleClose () {
    
    this.$emit('close')
  }

  handleSubmit () {
    
    this.$emit('submit')
  }
}
</script>