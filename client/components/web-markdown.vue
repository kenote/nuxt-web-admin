<template>
  <div v-if="outline" class="vditor-warpper">
    <div ref="preview" class="vditor-reset" />
    <div ref="outline" class="vditor-outline" />
  </div>
  <div v-else ref="preview" class="vditor-reset" style="margin:auto" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import Vditor from 'vditor'
import { get } from 'lodash'

@Component<WebMarkdown>({
  name: 'web-markdown',
  async mounted () {
    await this.initialPreview()
  }
})
export default class WebMarkdown extends Vue {

  @Prop({ default: '' })
  content!: string

  @Prop({ default: undefined })
  disabledClick!: true

  @Prop({ default: false })
  outline!: boolean | 'left' | 'right'

  async initialPreview () {
    let previewElement = this.$refs['preview'] as HTMLElement
    await Vditor.preview(previewElement as HTMLDivElement, this.content, {
      mode: 'light',
      hljs: {
        lineNumber: true
      },
      markdown: {
        autoSpace: true,
        paragraphBeginningSpace: true,
      },
    })
    if (this.outline) {
      let outlineElement = this.$refs['outline'] as HTMLElement
      Vditor.outlineRender(previewElement, outlineElement)
    }
    // 监听点击事件
    previewElement.addEventListener('click', evt => {
      let envParent = get(evt, ['path', 1])
      // 判断父元素是否是链接
      if (get(envParent, 'tagName') === 'A') {
        let link = envParent as HTMLLinkElement
        link.target = '_blank'
      }
      // 预览图片
      else if (get(evt.target, 'tagName') === 'IMG' && !this.disabledClick) {
        Vditor.previewImage(evt.target as HTMLImageElement)
      }
      // 链接设置新窗口打开
      else if (get(evt.target, 'tagName') === 'A') {
        let link = evt.target as HTMLLinkElement
        link.target = '_blank'
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.vditor-warpper {
  display: flex;
  flex-direction: row;
}
</style>