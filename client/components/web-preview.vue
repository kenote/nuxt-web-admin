<template>
  <web-dialog
    :title="titlename"
    :env="env"
    :is-submit="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="submit(null, null, { afterCommand: closeAfter })"
    @submit="submit(null, null, { afterCommand: closeAfter })"
    >
    <web-codemirror
      :value="content"
      theme="nord"
      :line-numbers="true"
      :read-only="true"
      :is-copy="true"
      :line-wrapping="true"
      />
    
  </web-dialog>
</template>

<script lang="ts">
import { Component, Vue, mixins, Prop, Emit, Provide } from 'nuxt-property-decorator'
import EnvironmentMixin from '~/mixins/environment'
import { Channel, Command } from '@/types/client'
import { parseTemplate } from '@/utils'

@Component<WebPreview>({
  name: 'web-preview',
  created () {
    this.titlename = parseTemplate(this.title, this.env)
    if (this.request) {
      this.getData(this.request, { download: { type: 'preview' } }, data => {
        this.content = data
      })
    }
  }
})
export default class WebPreview extends mixins(EnvironmentMixin) {

  @Prop({ default: '' })
  title!: string

  @Prop({ default: undefined })
  request!: Channel.RequestConfig

  @Prop({ default: false })
  loading!: boolean
  

  @Prop({ default: undefined })
  closeAfter!: string[]

  @Provide()
  titlename: string = ''

  @Provide()
  content: string = ''

  @Emit('get-data')
  getData (request: Channel.RequestConfig, options: Record<string,any> | null, next: (data: string) => void) {}

  @Emit('submit')
  submit (values: Record<string, any>, action: Channel.RequestConfig, options: Channel.SubmitOptions) {}
}
</script>