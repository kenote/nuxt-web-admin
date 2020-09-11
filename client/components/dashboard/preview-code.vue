<template>
  <fragment>
    <el-dialog class="preview-code" v-bind:class="!Array.isArray(data) ? 'preview-code-readonly' : ''"
      :title="title"
      fullscreen
      :close-on-click-modal="false"
      :modal="false"
      :visible="visible"
      @close="$emit('close')">
      <el-tabs v-if="Array.isArray(data)" v-model="activeTag" tab-position="bottom" type="border-card">
        <el-tab-pane v-for="item in data" :key="item.key" :label="item.name" :name="item.key" :lazy="true">
          <dashboard-codemirror v-model="item.content" theme="duotone-dark" type="text/x-yaml" :read-only="true" />
        </el-tab-pane>
      </el-tabs>
      <dashboard-codemirror v-else v-model="data" theme="duotone-dark" type="text/x-yaml" :read-only="true" />
    </el-dialog>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import 'codemirror/theme/duotone-dark.css'
import * as yaml from 'js-yaml'
import { isYaml } from '@/utils'
import { oc } from 'ts-optchain'

interface PreviewData {
  key            : string
  name           : string
  content        : string
}

@Component<DashboardPreviewCode>({
  name: 'dashboard-preview-code',
  created () {
    this.activeTag = this.tag
  },
})
export default class DashboardPreviewCode extends Vue {

  @Prop({ default: undefined }) title!: string
  @Prop({ default: false }) visible!: boolean
  @Prop({ default: undefined }) data!: PreviewData[] | string
  @Prop({ default: undefined }) tag!: string

  @Provide() activeTag: string = ''

  @Watch('tag')
  onTagChange(val: string, oldVal: string): void {
    this.activeTag = val
  }
  
}
</script>

<style lang="scss">
.preview-code {
  .el-dialog__body {
    height: calc(100% - 54px);
    padding-bottom: 0;
    padding-top: 10px;

    .container {
      line-height: initial;
      height: 100%;

      .CodeMirror {
        height: 100%;
      }

      .CodeMirror-simplescroll-horizontal, .CodeMirror-simplescroll-vertical {
        background: #2a2834;

        div {
          background: #4f4c5f;
          border: 0;
        }
      }
    }

    .el-tabs--border-card {
      background: #2a2734;

      .el-tabs__nav-wrap {
        background: #2a2734;
      }

      &>.el-tabs__header .el-tabs__item.is-active {
        background: #3f3d47;
        border-right-color: #606268;
        border-left-color: #606268;
        border: 0;
      }

      &>.el-tabs__content {
        padding: 0;
      }
    }

    .el-tabs__content {
      height: calc(100vh - 140px);

      .el-tab-pane {
        height: calc(100vh - 140px);
      }
    }
  }

  .el-tabs--bottom .el-tabs__header.is-bottom {
    margin-top: 1px;
  }

  &.preview-code-readonly {
    .el-dialog__body {
      height: calc(100% - 90px);
    }
  }
}
</style>