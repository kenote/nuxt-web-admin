<template>
  <div ref="preview" class="vditor-reset" />
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

  async initialPreview () {
    let previewElement = this.$refs['preview'] as HTMLElement
    await Vditor.preview(previewElement as HTMLDivElement, this.content, {
      mode: 'light',
      hljs: {
        lineNumber: true
      }
    })
    // 点击查看图片
    previewElement.addEventListener('click', evt => {
      if (get(evt.target, 'tagName') === 'IMG') {
        Vditor.previewImage(evt.target as HTMLImageElement)
      }
    })
  }
}
</script>