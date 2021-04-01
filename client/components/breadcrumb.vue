<template>
  <div class="breadcrumb">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item, key) in breadcrumb" :key="key">{{ item.name }}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { Channel } from '@/types/client'
import { dataNodeProxy } from '@kenote/common'

@Component<Breadcrumb>({
  name: 'breadcrumb',
  created () {
    this.updateBreadcrumb(this.data)
  }
})
export default class Breadcrumb extends Vue {

  @Prop({ default: undefined })
  data!: Channel.DataNode[]

  @Prop({ default: undefined })
  routePath!: string

  @Provide()
  breadcrumb: Array<Pick<Channel.DataNode, 'key' | 'name'>> = []

  @Watch('data')
  onChannelChange (val: Channel.DataNode[], oldVal: Channel.DataNode[]) {
    if (val === oldVal) return
    this.updateBreadcrumb(val)
  }

  @Watch('routePath')
  onRouteChange (val: string, oldVal: string) {
    if (val === oldVal) return
    this.updateBreadcrumb(this.data)
  }

  updateBreadcrumb (data: Channel.DataNode[]) {
    let breadcrumb: Array<Pick<Channel.DataNode, 'key' | 'name'>> = []
    if (data) {
      if (this.routePath) {
        let item = dataNodeProxy(data ?? []).find({ route: this.routePath })
        breadcrumb = item?.maps ?? []
      }
    }
    this.breadcrumb = breadcrumb
  }
}
</script>