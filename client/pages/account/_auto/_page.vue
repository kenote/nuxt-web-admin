<template>
  <dashboard v-loading="initinal">
    
    <!-- 创建视图容器 -->
    <web-component v-for="component in components" 
      :key="component.key"
      :type="component.name"
      v-model="component.value"
      :options="merge(component.options, { 
        options: { avatar: avatarOptions },
        defaultValues: parseParams(component.options.defaultValues || '')({ auth })
      })"
      :http-options="httpOptions"
      :editor-config="editorConfig"
      @get-data="handleGetData"
      @upload-file="uploadFile"
      @submit="handleSubmit"
      :loading="loading"
      />
    <!-- 创建工具按钮 -->
    <fragment slot="tools">
      <template v-for="tool in tools">
        <el-tooltip :key="tool.key" :content="tool.name" placement="left-start">
          <el-button type="info" :icon="tool.icon" circle @click="handleCommand(tool.command)"></el-button>
        </el-tooltip>
      </template>
      
    </fragment>
    <!-- 创建抽屉式工具 -->
    <web-drawer :placement="drawerOptions.placement" :width="drawerOptions.width" :visible="drawerOptions.key" @close="handleCloseDrawer">
      <div class="container" ref="drawerContauner">
        <div class="drawer__header">
          <span>{{drawerOptions.name}}</span>
        </div>
        <perfect-scrollbar :options="{ suppressScrollX: true }">
          <div class="drawer__bodyer">
            <web-form-item
              :value="configuration"
              type="codemirror"
              width="auto"
              :height="drawerContaunerHeight - 100"
              :options="{
                theme: 'monokai',
                contentType: 'text/x-yaml',
                lineNumbers: true,
                tabSize: 2,
                isCopy: true,
                readOnly: true
              }"
              />
          </div>
        </perfect-scrollbar>
      </div>
    </web-drawer>
  </dashboard>
</template>

<script lang="ts">
import { Component, mixins, Provide, Watch } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { Channel, Verify, HttpResult } from '@/types/client'
import { isString, merge } from 'lodash'
import { isYaml, parseParams, parseCommand } from '@/utils'
import jsYaml from 'js-yaml'
// import { HttpResult } from '@/utils/http-client'
import { PutResult } from '@kenote/upload'

interface DrawerOptions {
  key         : string
  name       ?: string
  placement  ?: 'top' | 'bottom' | 'left' | 'right'
  width      ?: number
}

@Component<AutoPage>({
  name: 'auto-page',
  middleware: [ 'authenticated' ],
  layout: 'dashboard',
  mounted () {
    
  }
})
export default class AutoPage extends mixins(PageMixin) {

  @Provide()
  containers: Channel.Container[] = []

  @Provide()
  tools: Channel.Tool[] = []

  @Provide()
  components: Channel.Component[] = []

  @Provide()
  drawerType: string = ''

  @Provide()
  drawerOptions: DrawerOptions = { key: '' }

  @Provide()
  drawerContaunerHeight: number = 0

  @Provide()
  configuration: string = ''

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
  async onPageSetting (val: Partial<Channel.DataNode>, oldVal: Partial<Channel.DataNode>) {
    if (val === oldVal) return
    this.initinalPage(val)
  }

  @Watch('drawerOptions')
  onDrawerOptions (val: DrawerOptions, oldVal: DrawerOptions) {
    if (val === oldVal) return
    if (val.key) {
      let drawerContauner = this.$refs['drawerContauner'] as HTMLDivElement
      console.log(drawerContauner && drawerContauner.clientHeight)
      if (drawerContauner) {
        this.drawerContaunerHeight = drawerContauner.clientHeight
      }
    }
  }

  merge = merge
  parseParams = parseParams
  
  /**
   * 初始化页面
   */
  async initinalPage (options: Partial<Channel.DataNode>) {
    let { configuration } = options
    if (!configuration) return
    if (isString(configuration)) {
      try {
        let result = await this.$httpClient().GET(configuration)
        if (!isString(result) && !isYaml(result)) return
        let { container, tools, components } = jsYaml.load(result) as Channel.Configuration
        console.log(components)
        this.containers = container ?? []
        this.tools = tools ?? []
        this.configuration = result
        this.components = components ?? []
      } catch (error) {
        
      }
    }
    else {
      let { container, tools } = configuration as Channel.Configuration
      this.containers = container ?? []
      this.tools = tools ?? []
        this.configuration = jsYaml.dump(configuration)
    }
  }

  /**
   * 获取单项数据
   */
  handleGetData (options: Channel.RequestConfig, next: (data: Channel.FormItemData[]) => void) {
    let { method, url } = options
    let httpClient = this.$httpClient(this.httpOptions)
    setTimeout(async () => {
      let result = await httpClient[method!](url!) as HttpResult
      next(result.data ?? [])
    }, 500);
    
  }

  /**
   * 提交数据
   */
  handleSubmit (values: any, action: Channel.RequestConfig, options: Channel.SubmitOptions) {
    console.log(values, action, options)
    this.loading = true
    setTimeout(() => {
      this.loading = false
    }, 3000);
    
  }

  /**
   * 上传文件
   */
  async uploadFile (file: File | File[] | string, options: any, next: (doc: any, err?: Error) => void)  {
    try {
      if (options.type === 'avatar') {
        let result = await this.handleUpdateAvatar(file as File | string)
        next(result)
      }
    } catch (error) {
      next(null, error)
    }
  }

  /**
   * 更新/上传头像
   */
  async handleUpdateAvatar (file: File | string) {
    let url = ''
    let { upload, save } = this.avatarOptions
    if ( typeof file === 'object') {
      let formData = new FormData()
      formData.append('file[]', file)
      let result = await this.$httpClient(this.httpOptions).upload<HttpResult<PutResult[]>>(upload!, formData)
      if (result?.error) {
        throw new Error(result.error)
      }
      if (result?.data) {
        url = result.data[0].url
      }
    }
    else {
      url = file
    }
    let info = await this.$httpClient(this.httpOptions)[save?.method!](save?.url!, parseParams(this.avatarOptions.save?.params!)({ url })) as HttpResult
    if (info?.error) {
      throw new Error(info.error)
    }
    this.$store.commit(this.types.auth.AVATAR, info?.data.avatar)
    return url
  }

  /**
   * 指令操作
   */
  handleCommand (value: string) {
    let command = parseCommand(value)
    if (!command) return
    // 处理自定义指令
    if (command.type === 'command') {
      switch (command.path) {
        case 'view':
          this.drawerOptions = {
            key: 'view',
            name: '页面配置',
            placement: 'right',
            width: 960
          }
          break
        default:
          break
      }
    }
    // 处理内部路由
    else if (command.type === 'router') {
      this.$router.push(command.path)
    }
    // 处理外部链接
    else if (command.type === 'http') {
      let link = document.createElement('a')
      link.href = command.path
      link.target = '_blank'
      link.click()
    }
  }

  handleCloseDrawer () {
    // this.drawerVisible = false
    this.drawerOptions = { key: '' }
  }
  
}
</script>