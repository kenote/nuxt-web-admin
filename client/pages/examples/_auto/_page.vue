<template>
  <dashboard v-loading="initinal || refresh">
    <section class="example-container" v-if="pageSetting.example && !refresh">
      <h2>{{ name }}</h2>
      <p v-if="description">{{ description }}</p>
      
      <!-- 组件示例 -->
      <template v-for="(display, key) in displays">
        <fragment :key="display.key || key">
          <h3>{{ display.name }}</h3>
          <div class="display" v-bind:class="display.layout === 'vertical' ? 'vertical' : ''">
            <div class="preview" v-if="display.preview">
              <el-tabs value="preview" type="card">
                <el-tab-pane label="Preview" name="preview" lazy>
                  <p v-if="display.preview.description">{{ display.preview.description }}</p>
                  <web-component
                    :type="display.preview.component"
                    v-model="display.preview.value"
                    :options="display.preview.options"
                    />
                </el-tab-pane>
              </el-tabs>
            </div>
            <el-tabs v-model="display.active" type="card">
              <el-tab-pane v-for="tabPane in display.tabPanes" :key="tabPane.key" :label="tabPane.name" :name="tabPane.key" lazy>
                <web-form-item v-if="tabPane.codemirror"
                  :value="tabPane.codemirror.code"
                  type="codemirror"
                  width="auto"
                  :height="420"
                  :options="{
                    theme: 'nord',
                    contentType: tabPane.codemirror.type,
                    lineNumbers: true,
                    lineWrapping: true,
                    tabSize: 2,
                    isCopy: true
                  }"
                  style="margin: 0 10px;"
                  disabled />
              </el-tab-pane>
            </el-tabs>
          </div>
        </fragment>
      </template>

      <!-- 组件属性 -->
      <template v-for="(attribute, key) in attributes">
        <fragment :key="attribute.key || key">
          <h3>{{ attribute.name }}</h3>
          <p v-if="attribute.description">{{ attribute.description }}</p>
          <web-table 
            :columns="attribute.columns"
            :data="attribute.data"
            />
        </fragment>
      </template>
    </section>
  </dashboard>
</template>

<script lang="ts">
import { Component, mixins, Provide, Watch } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { Channel } from '@/types/client'
import jsYaml from 'js-yaml'
import { isString } from 'lodash'
import { isYaml } from '@/utils'

@Component<AutoPage>({
  name: 'auto-page',
  middleware: [ 'authenticated' ],
  layout: 'dashboard',
})
export default class AutoPage extends mixins(PageMixin) {

  @Watch('refresh')
  onrefreshChange (val: boolean, oldVal: boolean) {
    if (val === oldVal) return
    if (val) {
      setTimeout(async () => {
        await this.initinalPage(this.pageSetting)
        this.completeRefresh()
      }, 800)
    }
  }

  @Watch('pageSetting')
  async onPageSetting(val: Partial<Channel.DataNode>, oldVal: Partial<Channel.DataNode>) {
    if (val === oldVal) return
    this.initinalPage(val)
  }

  @Provide()
  name: string = ''
  
  @Provide()
  description?: string

  @Provide()
  displays?: Channel.ExampleDisplay[] = []
  
  @Provide()
  attributes: Channel.ExampleAttributes[] = []

  async initinalPage (options: Partial<Channel.DataNode>) {
    let { example, name, description } = options
    this.name = name!
    this.description = description
    if (!example) return
    if (isString(example)) {
      try {
        let result = await this.$httpClient().GET(example)
        if (!isString(result) && !isYaml(result)) return
        let { display, attributes } = jsYaml.load(result) as Channel.Example
        this.displays = display ?? []
        this.attributes = attributes ?? []
      } catch (error) {
        
      }
    }
    else {
      let { display, attributes } = example
      this.displays = display ?? []
      this.attributes = attributes ?? []
    }
  }
}
</script>

<style lang="scss">
.example-container {
  margin: auto;
  max-width: 1200px;
  margin-top: 20px;
  color: #444242;

  h2 {
    font-weight: 400;
    font-size: 28px;
  }

  p {
    font-size: 14px;
    color: #5e6d82;
    line-height: 1.5em;
    margin: 10px 0;
  }
  
  h3 {
    margin: 55px 0 20px;
    font-weight: 400;
    font-size: 22px;
  }

  .display {
    border: 1px #e4e4e4 solid;
    margin-top: 20px;
    min-height: 500px;
    display: flex;

    .el-tabs {
      width: 100%;
      height: 100%;
    }

    .el-tabs--card>.el-tabs__header .el-tabs__nav {
      border-radius: 0;
      border-top-width: 0;
      border-left-width: 0;
    }

    .el-tabs__content {
      height: calc(100% - 70px);
    }

    .preview {
      margin: 0;
      flex: 0 0 50%;
      height: inherit;
      border-right: 1px #e4e4e4 solid;

      .el-tabs__content {
        padding: 20px 40px;
      }
        
      .el-transfer__buttons {
        display: inline-flex;
        flex-direction: column;
  
        .el-button--primary {
          width: auto;
          border-radius: 4px;
        }

        .el-button+.el-button {
          margin-left: 0;
        }

      }

      .el-transfer-panel {
        width: 240px;
      }

      .el-transfer-panel__body {
        height: 264px;

        .el-input {
          padding-right: 30px;
        }
      }

      .el-transfer-panel__item {
        margin-left: 0;
        display: block!important;
      }
    }

    &.vertical {
      flex-direction: column;

      .preview {
        border-right: 0;
        border-bottom: 1px #e4e4e4 solid;
        height: 500px;
      }

      .el-tabs {
        height: 500px;
      }
    }
  }
}
</style>